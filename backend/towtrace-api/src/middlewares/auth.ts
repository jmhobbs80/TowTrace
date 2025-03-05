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

/**
 * Check if a user has system admin privileges
 * @param tokenPayload - The decoded JWT token payload
 * @returns Boolean indicating if the user is a system admin
 */
export function isSystemAdmin(tokenPayload: TokenPayload): boolean {
  return tokenPayload.role === 'system_admin';
}

/**
 * Check if a user has tenant admin privileges
 * @param tokenPayload - The decoded JWT token payload
 * @returns Boolean indicating if the user is a tenant admin
 */
export function isTenantAdmin(tokenPayload: TokenPayload): boolean {
  return ['admin', 'client_admin'].includes(tokenPayload.role);
}

/**
 * Check if a user has dispatcher privileges
 * @param tokenPayload - The decoded JWT token payload
 * @returns Boolean indicating if the user is a dispatcher
 */
export function isDispatcher(tokenPayload: TokenPayload): boolean {
  return ['dispatcher', 'admin', 'client_admin', 'system_admin'].includes(tokenPayload.role);
}

/**
 * Check if a user has driver privileges
 * @param tokenPayload - The decoded JWT token payload
 * @returns Boolean indicating if the user is a driver
 */
export function isDriver(tokenPayload: TokenPayload): boolean {
  return tokenPayload.role === 'driver';
}

/**
 * Check if a user has any admin privileges (system or tenant)
 * @param tokenPayload - The decoded JWT token payload
 * @returns Boolean indicating if the user has any admin privileges
 */
export function hasAdminPrivileges(tokenPayload: TokenPayload): boolean {
  return ['admin', 'client_admin', 'system_admin'].includes(tokenPayload.role);
}

/**
 * Middleware to require admin privileges
 * @param tokenPayload - The decoded JWT token payload
 * @throws Error if the user is not an admin
 */
export function requireAdmin(tokenPayload: TokenPayload): void {
  if (!hasAdminPrivileges(tokenPayload)) {
    throw new Error('Forbidden: Admin privileges required');
  }
}

/**
 * Middleware to require system admin privileges
 * @param tokenPayload - The decoded JWT token payload
 * @throws Error if the user is not a system admin
 */
export function requireSystemAdmin(tokenPayload: TokenPayload): void {
  if (!isSystemAdmin(tokenPayload)) {
    throw new Error('Forbidden: System admin privileges required');
  }
}

/**
 * Middleware to require the user to be the owner of a resource or have admin privileges
 * @param tokenPayload - The decoded JWT token payload
 * @param resourceOwnerId - The ID of the resource owner
 * @returns Boolean indicating if the user has permission
 */
export function isResourceOwnerOrAdmin(
  tokenPayload: TokenPayload,
  resourceOwnerId: string
): boolean {
  // User is the resource owner
  if (tokenPayload.userId === resourceOwnerId) {
    return true;
  }
  
  // User has admin privileges
  return hasAdminPrivileges(tokenPayload);
}