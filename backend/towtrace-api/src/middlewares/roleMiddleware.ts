import { Env, TokenPayload } from '../types';
import { Hono } from 'hono';
import { 
  hasAdminPrivileges, 
  isSystemAdmin, 
  isTenantAdmin, 
  isDispatcher,
  isDriver
} from './auth';

/**
 * Middleware to restrict access to system admins only
 */
export function systemAdminOnly<T>() {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    if (!isSystemAdmin(tokenPayload)) {
      return c.json(
        { error: 'Forbidden', message: 'Only system administrators can access this resource' },
        403
      );
    }
    
    await next();
  };
}

/**
 * Middleware to restrict access to tenant admins and above
 */
export function tenantAdminOnly<T>() {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    if (!(isTenantAdmin(tokenPayload) || isSystemAdmin(tokenPayload))) {
      return c.json(
        { error: 'Forbidden', message: 'Only tenant administrators can access this resource' },
        403
      );
    }
    
    await next();
  };
}

/**
 * Middleware to restrict access to dispatchers and above
 */
export function dispatcherAndAbove<T>() {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    if (!isDispatcher(tokenPayload)) {
      return c.json(
        { error: 'Forbidden', message: 'Only dispatchers and administrators can access this resource' },
        403
      );
    }
    
    await next();
  };
}

/**
 * Middleware to restrict access to admins (any type)
 */
export function adminOnly<T>() {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    if (!hasAdminPrivileges(tokenPayload)) {
      return c.json(
        { error: 'Forbidden', message: 'Only administrators can access this resource' },
        403
      );
    }
    
    await next();
  };
}

/**
 * Middleware to restrict access to drivers only
 */
export function driverOnly<T>() {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    if (!isDriver(tokenPayload)) {
      return c.json(
        { error: 'Forbidden', message: 'Only drivers can access this resource' },
        403
      );
    }
    
    await next();
  };
}

/**
 * Middleware to check if user is accessing their own resource or has admin privileges
 * @param getResourceOwnerId - Function to extract the resource owner ID from the request
 */
export function ownerOrAdmin<T>(getResourceOwnerId: (c: Hono.Context<T>) => Promise<string> | string) {
  return async (c: Hono.Context<T>, next: () => Promise<void>) => {
    const tokenPayload = c.get('tokenPayload') as TokenPayload;
    
    // Admin bypass - admins can access any resource
    if (hasAdminPrivileges(tokenPayload)) {
      await next();
      return;
    }
    
    // Get the resource owner ID
    const resourceOwnerId = await Promise.resolve(getResourceOwnerId(c));
    
    // Check if the user is the resource owner
    if (tokenPayload.userId === resourceOwnerId) {
      await next();
      return;
    }
    
    // Otherwise, deny access
    return c.json(
      { error: 'Forbidden', message: 'You do not have permission to access this resource' },
      403
    );
  };
}