import { D1Database, Request } from '@cloudflare/workers-types';
import { verifyToken } from './middlewares/auth';
import { checkSubscriptionAccess } from './middlewares/subscriptionCheck';

// Import controllers
import * as overwatch from './controllers/overwatch';
import * as eld from './controllers/eld';
import * as subscriptionPayment from './controllers/subscriptionPayment';

// API routes
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
  
  // Test route
  'GET /api/test': async () => new Response('TowTrace API is live!', { status: 200 }),
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    try {
      // Verify JWT token if present
      const tokenPayload = await verifyToken(request, env);
      
      // Check subscription-based access
      if (tokenPayload) {
        const hasAccess = await checkSubscriptionAccess(request, env, tokenPayload);
        if (hasAccess === false) {
          return new Response(JSON.stringify({
            error: 'SubscriptionRequired',
            message: 'Your subscription plan does not have access to this feature',
            status: 403,
          }), { status: 403, headers });
        }
      }
      
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
        return await handler(request, env, ...Object.values(params));
      }
      
      // Route not found
      return new Response(JSON.stringify({
        error: 'NotFound',
        message: 'Route not found',
        status: 404,
      }), { status: 404, headers });
    } catch (error) {
      console.error('API Error:', error);
      
      // Check if error is a Response
      if (error instanceof Response) {
        return error;
      }
      
      // Format error message
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      return new Response(JSON.stringify({
        error: 'InternalServerError',
        message: errorMessage,
        status: 500,
      }), { status: 500, headers });
    }
  },
};

interface Env {
  DB: D1Database;
  QUICKBOOKS_CLIENT_ID?: string;
  QUICKBOOKS_CLIENT_SECRET?: string;
  JWT_SECRET: string;
}