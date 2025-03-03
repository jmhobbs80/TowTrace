import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for the TowTrace Dashboard
 * Handles:
 * - Authentication verification
 * - Security headers
 * - Rate limiting (in production)
 * - Redirects for protected routes
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers to all responses
  const securityHeaders = {
    // Basic security headers
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://i.pravatar.cc https://*.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://towtrace-api.justin-michael-hobbs.workers.dev",
      "frame-src 'self' https://accounts.google.com"
    ].join('; '),
    
    // Permissions policy
    'Permissions-Policy': [
      'camera=(self)',
      'microphone=()',
      'geolocation=(self)',
      'interest-cohort=()'
    ].join(', '),
    
    // Strict Transport Security (only in production)
    ...(process.env.NODE_ENV === 'production' 
      ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' } 
      : {})
  };
  
  // Add security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/jobs',
    '/dashboard/vehicles',
    '/dashboard/drivers',
    '/dashboard/settings',
    '/dashboard/inspections',
    '/dashboard/quickbooks',
    '/api/'
  ];
  
  // Check if the requested path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Public routes that don't need authentication checks
  const publicRoutes = ['/', '/login', '/api/auth'];
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Get authentication token from cookies
    const authToken = request.cookies.get('token')?.value;
    const expiresAt = request.cookies.get('expiresAt')?.value;
    
    // If no token or expired token, redirect to login
    if (!authToken || !expiresAt || parseInt(expiresAt, 10) < Date.now()) {
      // Store the intended destination to redirect back after login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('from', pathname);
      
      return NextResponse.redirect(url);
    }
  }
  
  // If it's the root page and user is authenticated, redirect to dashboard
  if (pathname === '/' && request.cookies.get('token')?.value) {
    const isFromLogin = request.nextUrl.searchParams.get('from') === 'login';
    
    if (isFromLogin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  return response;
}

// Apply middleware to specific routes
export const config = {
  // Match all routes except static files, images, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};