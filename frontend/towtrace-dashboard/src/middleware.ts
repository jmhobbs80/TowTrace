import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

/**
 * TowTrace Middleware
 * 
 * Handles:
 * 1. Authentication for protected routes
 * 2. CSRF protection
 * 3. Rate limiting for API routes
 * 4. Security headers
 * 5. HTTPS enforcement
 * 6. Role-based access control
 */

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

// In-memory store for rate limiting (would use Redis in production)
const ipRequestCounts = new Map<string, { count: number, timestamp: number }>();

export async function middleware(request: NextRequest) {
  // Check if we're in development mode and bypass most checks
  const isDev = process.env.NODE_ENV === 'development';
  const response = NextResponse.next();
  
  // Only add security headers in production
  if (!isDev) {
    addSecurityHeaders(response);
  }
  
  // 1. HTTPS Enforcement (skip in development)
  if (!isDev && request.headers.get('x-forwarded-proto') === 'http') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  
  // 2. CSRF Protection (skip in development)
  if (!isDev && request.method === 'POST' && !validateCsrfHeaders(request)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 3. Rate Limiting for API routes (skip in development)
  if (!isDev && request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const isRateLimited = checkRateLimit(ip);
    
    if (isRateLimited) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  // 4. Authentication & Authorization for protected routes
  // In development, don't redirect for auth if /api/auth/ routes don't exist yet
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    (!isDev && request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/'))
  ) {
    try {
      // Get Auth0 session (skip in development if needed)
      if (!isDev) {
        const session = await getSession(request, response);
        
        // If no session, redirect to login
        if (!session?.user) {
          const url = new URL('/api/auth/login', request.url);
          url.searchParams.set('returnTo', encodeURI(request.nextUrl.pathname));
          return NextResponse.redirect(url);
        }
        
        // 5. Role-based access control
        if (
          (request.nextUrl.pathname.startsWith('/dashboard/fleet') && session.user.role !== 'dispatcher') ||
          (request.nextUrl.pathname.startsWith('/dashboard/admin') && session.user.role !== 'admin')
        ) {
          // Redirect to appropriate dashboard based on role
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    } catch (error) {
      // If there's an error during auth check (like Auth0 not being configured),
      // allow the request to continue in development mode
      if (!isDev) {
        return new NextResponse(JSON.stringify({ error: 'Authentication error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }
  
  return response;
}

// Paths to apply middleware to
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
    '/api/:path*',
  ],
};

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://towtrace-api.justin-michael-hobbs.workers.dev https://api.mapbox.com;
    frame-src 'self' https://accounts.google.com https://api.quickbooks.com;
    worker-src 'self' blob:;
  `.replace(/\s+/g, ' ').trim();

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  return response;
}

/**
 * Validate CSRF headers
 */
function validateCsrfHeaders(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow requests from the same origin
  if (!origin && !referer) return true;
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_DOMAIN || 'www.towtrace.com',
    'localhost:3000',
  ];
  
  const isValidOrigin = allowedOrigins.some(allowed => {
    return origin?.includes(allowed) || referer?.includes(allowed);
  });
  
  return isValidOrigin;
}

/**
 * Check rate limit for IP
 * Returns true if rate limited, false otherwise
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  
  if (!record) {
    // First request from this IP
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    // Window expired, reset count
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  // Increment count
  record.count += 1;
  ipRequestCounts.set(ip, record);
  
  // Check if over limit
  return record.count > MAX_REQUESTS_PER_WINDOW;
}