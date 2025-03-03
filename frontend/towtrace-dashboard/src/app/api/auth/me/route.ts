import { NextRequest } from 'next/server';

/**
 * Mock user data endpoint for development
 */
export async function GET(req: NextRequest) {
  // Check for our mock session
  const cookie = req.cookies.get('appSession');
  
  if (cookie && cookie.value === 'mock-session') {
    // Return mock user data
    return new Response(JSON.stringify({
      name: 'Development User',
      email: 'dev@towtrace.com',
      role: 'admin',
      sub: 'dev-user-id-123',
      picture: 'https://i.pravatar.cc/150?u=dev@towtrace.com'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Unauthorized
  return new Response(JSON.stringify({ error: 'Not authenticated' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}