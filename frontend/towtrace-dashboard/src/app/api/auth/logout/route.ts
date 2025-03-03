import { NextRequest } from 'next/server';

/**
 * Mock logout handler for development
 */
export async function GET(req: NextRequest) {
  // Clear the cookie and redirect to home
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': 'appSession=; Path=/; HttpOnly; Max-Age=0',
    }
  });
}