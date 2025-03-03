// @ts-nocheck
import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

/**
 * Auth0 handler for authentication routes
 * Handles login, callback, logout, and other Auth0 routes
 * 
 * Routes:
 * - /api/auth/login: Redirects to Auth0 login page
 * - /api/auth/callback: Handles the callback from Auth0
 * - /api/auth/logout: Logs out the user
 * - /api/auth/me: Returns the user profile
 */
export const GET = async (req: NextRequest) => {
  try {
    // For development, use local URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : (process.env.AUTH0_BASE_URL || 'https://www.towtrace.com');
    
    const res = await handleAuth({
      login: handleLogin({
        authorizationParams: {
          // Request offline access to get a refresh token
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access',
          // When the user completes login, redirect to dashboard by default
          redirect_uri: `${baseUrl}/api/auth/callback`,
        },
        returnTo: '/dashboard',
      }),
      callback: handleCallback({
        redirectUri: `${baseUrl}/api/auth/callback`,
        afterCallback: (req, res, session) => {
          // Store user role or other claims in the session
          if (session.user) {
            // Add user role if available in token
            if (session.user['https://towtrace.com/roles']) {
              session.user.role = session.user['https://towtrace.com/roles'][0];
            } else {
              // Default role if not specified
              session.user.role = 'user';
            }
          }
          return session;
        },
      }),
    })(req);
    
    return res;
  } catch (error) {
    // In development mode, provide a clearer error message
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth0 error:', error);
      // For development, create a mock user session to bypass Auth0
      if (req.nextUrl.pathname === '/api/auth/login') {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/dashboard',
            'Set-Cookie': 'appSession=mock-session; Path=/; HttpOnly; Max-Age=86400',
          }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Auth0 configuration error',
        message: 'Using development mock. Make sure your .env.local file is set up with proper Auth0 credentials for production.',
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Re-throw for production
    throw error;
  }
};