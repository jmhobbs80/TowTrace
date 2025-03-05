import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, TokenPayload } from './types';
import { Request } from '@cloudflare/workers-types';
import { verifyToken, requireAuth } from './middlewares/auth';
import { checkSubscriptionAccess } from './middlewares/subscriptionCheck';

// Import controllers
import * as overwatch from './controllers/overwatch';
import * as eld from './controllers/eld';
import * as subscriptionPayment from './controllers/subscriptionPayment';
import driverDocsRouter from './controllers/driverDocs';
import notificationsRouter from './controllers/notifications';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// Authentication middleware
app.use('*', async (c, next) => {
  try {
    // Verify JWT token if present
    const tokenPayload = await verifyToken(c.req.raw, c.env);
    
    // Store token payload in context if available
    if (tokenPayload) {
      c.set('tokenPayload', tokenPayload);

      // Check subscription-based access
      const hasAccess = await checkSubscriptionAccess(c.req.raw, c.env, tokenPayload);
      if (hasAccess === false) {
        return c.json({
          error: 'SubscriptionRequired',
          message: 'Your subscription plan does not have access to this feature',
          status: 403,
        }, 403);
      }
    }
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof Response) {
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An authentication error occurred';
    return c.json({
      error: 'AuthError',
      message: errorMessage,
      status: 401,
    }, 401);
  }
});

// Health check route (public)
app.get('/api/test', (c) => {
  return c.text('TowTrace API is live!');
});

// Separate API router with authentication required
const apiRouter = new Hono<{
  Bindings: Env,
  Variables: { tokenPayload: TokenPayload }
}>();

// Mount API router with authentication
app.route('/api', apiRouter);

// Add authentication check for all API routes except explicitly public ones
apiRouter.use('*', async (c, next) => {
  // Skip authentication for explicitly public routes
  const publicPaths = ['/auth/google', '/auth/callback', '/auth/refresh'];
  const path = new URL(c.req.url).pathname.replace('/api', '');
  
  if (publicPaths.some(p => path.startsWith(p))) {
    await next();
    return;
  }
  
  try {
    // Require authentication for all other API routes
    if (!c.get('tokenPayload')) {
      const tokenPayload = await requireAuth(c.req.raw, c.env);
      c.set('tokenPayload', tokenPayload);
    }
    
    await next();
  } catch (error) {
    return c.json({
      error: 'Unauthorized',
      message: 'Valid authentication token required',
      status: 401,
    }, 401);
  }
});

// Mount Driver Documents router
apiRouter.route('/driver-docs', driverDocsRouter);

// Mount Notifications router
apiRouter.route('/notifications', notificationsRouter);

// Legacy API routes - these will be migrated to Hono routers in future updates
const API_ROUTES = {
  // Overwatch (subscription management) routes
  'POST /api/admin/overwatch/tenants': overwatch.createTenant,
  'PUT /api/admin/overwatch/tenants/:tenantId': overwatch.updateTenant,
  'GET /api/admin/overwatch/tenants': overwatch.getAllTenants,
  'GET /api/admin/overwatch/tenants/:tenantId': overwatch.getTenantById,
  
  // ELD routes
  'POST /api/eld/devices': eld.registerEldDevice,
  'POST /api/eld/telemetry': eld.processTelemetry,
  'GET /api/eld/devices': eld.getEldDevices,
  'GET /api/eld/drivers/:driverId/hos': eld.getDriverHos,
  
  // Subscription payment routes
  'POST /api/subscriptions/payments': subscriptionPayment.createPayment,
  'GET /api/subscriptions/payments/:tenantId': subscriptionPayment.getTenantPayments,
  'GET /api/subscriptions/pricing': subscriptionPayment.getPricingInfo,
};

// Handle legacy routes
app.all('*', async (c) => {
  const request = c.req.raw;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  try {
    // Find matching route with parameters
    let handler = null;
    let params = {};
    
    for (const [routePattern, routeHandler] of Object.entries(API_ROUTES)) {
      const [routeMethod, routePath] = routePattern.split(' ');
      
      if (routeMethod === method) {
        // Convert route pattern to regex
        const paramNames: string[] = [];
        let regexPattern = routePath.replace(/\/:[^/]+/g, (match) => {
          const paramName = match.slice(2);
          paramNames.push(paramName);
          return '/([^/]+)';
        });
        regexPattern = `^${regexPattern}$`;
        
        const regex = new RegExp(regexPattern);
        const match = path.match(regex);
        
        if (match) {
          handler = routeHandler;
          
          // Extract parameter values
          const values = match.slice(1);
          params = Object.fromEntries(
            paramNames.map((name, i) => [name, values[i]])
          );
          
          break;
        }
      }
    }
    
    if (handler) {
      // Call the handler with the request, environment, and parameters
      return await handler(request, c.env, ...Object.values(params));
    }
    
    // Route not found - if we get here, no route matched
    return c.json({
      error: 'NotFound',
      message: 'Route not found',
      status: 404,
    }, 404);
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if error is a Response
    if (error instanceof Response) {
      return error;
    }
    
    // Format error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return c.json({
      error: 'InternalServerError',
      message: errorMessage,
      status: 500,
    }, 500);
  }
});

// Export the Hono app as the default export
export default {
  fetch: app.fetch,
};