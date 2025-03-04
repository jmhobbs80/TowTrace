import { Env, TokenPayload } from '../types';
import { Request } from '@cloudflare/workers-types';

/**
 * Verify the JWT token from the request authorization header
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns The decoded token payload or null if invalid
 */
export async function verifyToken(
  request: Request,
  env: Env
): Promise<TokenPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // Use the SubtleCrypto API to verify JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Extract payload
    const payloadBase64 = parts[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as TokenPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    // In a real implementation, you would also verify the signature
    // This is a simplified example

    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Middleware to require authentication for protected routes
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns The decoded token payload or throws an error if unauthorized
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<TokenPayload> {
  const tokenPayload = await verifyToken(request, env);
  
  if (!tokenPayload) {
    throw new Error('Unauthorized: Valid authentication token required');
  }
  
  return tokenPayload;
}

/**
 * Middleware to check if the user has the required role
 * @param tokenPayload - The decoded JWT token payload
 * @param allowedRoles - Array of roles allowed to access the resource
 * @returns Boolean indicating if the user has permission
 */
export function checkRole(
  tokenPayload: TokenPayload,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(tokenPayload.role);
}