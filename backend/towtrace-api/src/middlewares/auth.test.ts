/**
 * Unit tests for Authentication Middleware
 */

import {
  verifyToken,
  requireAuth,
  checkRole,
  isSystemAdmin,
  isTenantAdmin,
  isDispatcher,
  isDriver,
  hasAdminPrivileges,
  requireAdmin,
  requireSystemAdmin,
  isResourceOwnerOrAdmin
} from './auth';
import { TokenPayload, Env } from '../types';

// Mock Request object
const createMockRequest = (authHeader?: string): Request => {
  const headers = new Headers();
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }
  
  return {
    headers,
  } as unknown as Request;
};

// Mock environment
const mockEnv: Env = {
  DB: {} as any,
  JWT_SECRET: 'test-secret',
};

// Sample token payload
const createTokenPayload = (role: string = 'admin', userId: string = 'user123'): TokenPayload => ({
  userId,
  role,
  tenantId: 'tenant123',
  exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
  iat: Math.floor(Date.now() / 1000),
});

// Mock token creation (simplified for testing)
const createMockToken = (payload: TokenPayload): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  // In a real implementation, you would sign this properly
  const signature = 'mock-signature';
  
  return `${header}.${encodedPayload}.${signature}`;
};

// Mock expired token
const createExpiredTokenPayload = (): TokenPayload => ({
  userId: 'user123',
  role: 'admin',
  tenantId: 'tenant123',
  exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  iat: Math.floor(Date.now() / 1000) - 7200,
});

// Mock console.error to prevent test output pollution
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Authentication Middleware', () => {
  describe('verifyToken', () => {
    it('should return null when no authorization header is present', async () => {
      const request = createMockRequest();
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return null when authorization header does not start with Bearer', async () => {
      const request = createMockRequest('Basic token123');
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return null when token is empty', async () => {
      const request = createMockRequest('Bearer ');
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return null when token does not have three parts', async () => {
      const request = createMockRequest('Bearer invalid.token');
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      const expiredPayload = createExpiredTokenPayload();
      const token = createMockToken(expiredPayload);
      const request = createMockRequest(`Bearer ${token}`);
      
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return the token payload when token is valid', async () => {
      const payload = createTokenPayload();
      const token = createMockToken(payload);
      const request = createMockRequest(`Bearer ${token}`);
      
      // Mock atob to decode our mock token
      global.atob = jest.fn().mockImplementation((str) => {
        return Buffer.from(str, 'base64').toString('binary');
      });
      
      const result = await verifyToken(request, mockEnv);
      expect(result).toEqual(payload);
    });

    it('should return null when an error occurs during verification', async () => {
      const request = createMockRequest('Bearer invalid.token.format');
      
      // Force an error by making JSON.parse throw
      jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
        throw new Error('Invalid JSON');
      });
      
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should throw an error when token is invalid', async () => {
      const request = createMockRequest();
      
      await expect(requireAuth(request, mockEnv)).rejects.toThrow(
        'Unauthorized: Valid authentication token required'
      );
    });

    it('should return the token payload when token is valid', async () => {
      const payload = createTokenPayload();
      const token = createMockToken(payload);
      const request = createMockRequest(`Bearer ${token}`);
      
      // Mock verifyToken to return a valid payload
      jest.spyOn(require('./auth'), 'verifyToken').mockResolvedValueOnce(payload);
      
      const result = await requireAuth(request, mockEnv);
      expect(result).toEqual(payload);
    });
  });

  describe('Role checking functions', () => {
    describe('checkRole', () => {
      it('should return true when user has an allowed role', () => {
        const payload = createTokenPayload('admin');
        const result = checkRole(payload, ['admin', 'system_admin']);
        expect(result).toBe(true);
      });

      it('should return false when user does not have an allowed role', () => {
        const payload = createTokenPayload('driver');
        const result = checkRole(payload, ['admin', 'system_admin']);
        expect(result).toBe(false);
      });
    });

    describe('isSystemAdmin', () => {
      it('should return true for system_admin role', () => {
        const payload = createTokenPayload('system_admin');
        expect(isSystemAdmin(payload)).toBe(true);
      });

      it('should return false for non-system_admin roles', () => {
        const payload = createTokenPayload('admin');
        expect(isSystemAdmin(payload)).toBe(false);
      });
    });

    describe('isTenantAdmin', () => {
      it('should return true for admin role', () => {
        const payload = createTokenPayload('admin');
        expect(isTenantAdmin(payload)).toBe(true);
      });

      it('should return true for client_admin role', () => {
        const payload = createTokenPayload('client_admin');
        expect(isTenantAdmin(payload)).toBe(true);
      });

      it('should return false for non-admin roles', () => {
        const payload = createTokenPayload('driver');
        expect(isTenantAdmin(payload)).toBe(false);
      });
    });

    describe('isDispatcher', () => {
      it('should return true for dispatcher role', () => {
        const payload = createTokenPayload('dispatcher');
        expect(isDispatcher(payload)).toBe(true);
      });

      it('should return true for admin roles', () => {
        const payload = createTokenPayload('admin');
        expect(isDispatcher(payload)).toBe(true);
        
        const clientAdminPayload = createTokenPayload('client_admin');
        expect(isDispatcher(clientAdminPayload)).toBe(true);
        
        const systemAdminPayload = createTokenPayload('system_admin');
        expect(isDispatcher(systemAdminPayload)).toBe(true);
      });

      it('should return false for non-dispatcher roles', () => {
        const payload = createTokenPayload('driver');
        expect(isDispatcher(payload)).toBe(false);
      });
    });

    describe('isDriver', () => {
      it('should return true for driver role', () => {
        const payload = createTokenPayload('driver');
        expect(isDriver(payload)).toBe(true);
      });

      it('should return false for non-driver roles', () => {
        const payload = createTokenPayload('admin');
        expect(isDriver(payload)).toBe(false);
      });
    });

    describe('hasAdminPrivileges', () => {
      it('should return true for admin roles', () => {
        const adminPayload = createTokenPayload('admin');
        expect(hasAdminPrivileges(adminPayload)).toBe(true);
        
        const clientAdminPayload = createTokenPayload('client_admin');
        expect(hasAdminPrivileges(clientAdminPayload)).toBe(true);
        
        const systemAdminPayload = createTokenPayload('system_admin');
        expect(hasAdminPrivileges(systemAdminPayload)).toBe(true);
      });

      it('should return false for non-admin roles', () => {
        const driverPayload = createTokenPayload('driver');
        expect(hasAdminPrivileges(driverPayload)).toBe(false);
        
        const dispatcherPayload = createTokenPayload('dispatcher');
        expect(hasAdminPrivileges(dispatcherPayload)).toBe(false);
      });
    });
  });

  describe('Permission requirement functions', () => {
    describe('requireAdmin', () => {
      it('should not throw for admin roles', () => {
        const adminPayload = createTokenPayload('admin');
        expect(() => requireAdmin(adminPayload)).not.toThrow();
        
        const clientAdminPayload = createTokenPayload('client_admin');
        expect(() => requireAdmin(clientAdminPayload)).not.toThrow();
        
        const systemAdminPayload = createTokenPayload('system_admin');
        expect(() => requireAdmin(systemAdminPayload)).not.toThrow();
      });

      it('should throw for non-admin roles', () => {
        const driverPayload = createTokenPayload('driver');
        expect(() => requireAdmin(driverPayload)).toThrow('Forbidden: Admin privileges required');
      });
    });

    describe('requireSystemAdmin', () => {
      it('should not throw for system_admin role', () => {
        const systemAdminPayload = createTokenPayload('system_admin');
        expect(() => requireSystemAdmin(systemAdminPayload)).not.toThrow();
      });

      it('should throw for non-system_admin roles', () => {
        const adminPayload = createTokenPayload('admin');
        expect(() => requireSystemAdmin(adminPayload)).toThrow('Forbidden: System admin privileges required');
      });
    });
  });

  describe('isResourceOwnerOrAdmin', () => {
    it('should return true when user is the resource owner', () => {
      const userId = 'user123';
      const payload = createTokenPayload('driver', userId);
      expect(isResourceOwnerOrAdmin(payload, userId)).toBe(true);
    });

    it('should return true when user is not the owner but has admin privileges', () => {
      const userId = 'user123';
      const adminId = 'admin456';
      const payload = createTokenPayload('admin', adminId);
      expect(isResourceOwnerOrAdmin(payload, userId)).toBe(true);
    });

    it('should return false when user is neither the owner nor an admin', () => {
      const userId = 'user123';
      const dispatcherId = 'dispatcher789';
      const payload = createTokenPayload('dispatcher', dispatcherId);
      expect(isResourceOwnerOrAdmin(payload, userId)).toBe(false);
    });
  });
});