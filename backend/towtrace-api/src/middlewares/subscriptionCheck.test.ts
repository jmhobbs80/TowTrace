/**
 * Unit tests for Subscription Middleware
 */

import { checkSubscriptionAccess, checkFeatureAccess } from './subscriptionCheck';
import { TokenPayload, Env, SUBSCRIPTION_ENDPOINTS } from '../types';

// Mock Request object
const createMockRequest = (url: string): Request => {
  return {
    url,
  } as unknown as Request;
};

// Mock subscription data
jest.mock('../models/SubscriptionFeature', () => ({
  DEFAULT_FEATURES: {
    basic: ['basic_feature', 'shared_feature'],
    premium: ['basic_feature', 'premium_feature', 'shared_feature'],
    enterprise: ['basic_feature', 'premium_feature', 'enterprise_feature', 'shared_feature']
  }
}));

describe('Subscription Middleware', () => {
  // Sample token payload
  const createTokenPayload = (role: string = 'admin', tenantId: string = 'tenant123'): TokenPayload => ({
    userId: 'user123',
    role,
    tenantId,
    exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    iat: Math.floor(Date.now() / 1000),
  });

  // Mock database response setup
  const mockFirst = jest.fn();
  const mockBind = jest.fn(() => ({ first: mockFirst }));
  const mockPrepare = jest.fn(() => ({ bind: mockBind }));
  
  // Mock environment
  const mockEnv: Env = {
    DB: {
      prepare: mockPrepare,
    } as any,
    JWT_SECRET: 'test-secret',
  };

  // Mock console.error to prevent test output pollution
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkSubscriptionAccess', () => {
    it('should return null when no token payload is provided', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/auth/login');
      const result = await checkSubscriptionAccess(request, mockEnv);
      expect(result).toBeNull();
    });

    it('should return true for system_admin regardless of endpoint', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/ai/somepremiumendpoint');
      const tokenPayload = createTokenPayload('system_admin');
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(true);
    });

    it('should return false when tenant is not found in the database', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/auth/login');
      const tokenPayload = createTokenPayload();
      
      // Mock database response for tenant not found
      mockFirst.mockResolvedValueOnce(null);
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(false);
    });

    it('should return true when endpoint is allowed for tenant subscription plan', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/vehicles/123');
      const tokenPayload = createTokenPayload();
      
      // Mock database response for tenant with basic plan
      mockFirst.mockResolvedValueOnce({ subscription_plan: 'basic' });
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith('SELECT subscription_plan FROM tenants WHERE id = ?');
      expect(mockBind).toHaveBeenCalledWith(tokenPayload.tenantId);
    });

    it('should return false when endpoint is not allowed for tenant subscription plan', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/ai/generate');
      const tokenPayload = createTokenPayload();
      
      // Mock database response for tenant with basic plan
      mockFirst.mockResolvedValueOnce({ subscription_plan: 'basic' });
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(false);
    });

    it('should handle endpoint patterns with wildcards correctly', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/vehicles/123/details');
      const tokenPayload = createTokenPayload();
      
      // Mock database response for tenant with basic plan
      mockFirst.mockResolvedValueOnce({ subscription_plan: 'basic' });
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(true);
    });

    it('should return false when an error occurs during database query', async () => {
      const request = createMockRequest('https://api.towtrace.com/api/vehicles/123');
      const tokenPayload = createTokenPayload();
      
      // Mock database error
      mockBind.mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const result = await checkSubscriptionAccess(request, mockEnv, tokenPayload);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('checkFeatureAccess', () => {
    it('should return true when feature is explicitly enabled for tenant', async () => {
      // Mock database responses
      mockFirst.mockResolvedValueOnce({ is_enabled: 1 });
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'premium_feature');
      
      expect(result).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith(
        'SELECT is_enabled FROM subscription_features WHERE tenant_id = ? AND feature_name = ?'
      );
      expect(mockBind).toHaveBeenCalledWith('tenant123', 'premium_feature');
    });

    it('should return false when feature is explicitly disabled for tenant', async () => {
      // Mock database responses
      mockFirst.mockResolvedValueOnce({ is_enabled: 0 });
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'premium_feature');
      
      expect(result).toBe(false);
    });

    it('should check subscription plan when feature is not explicitly set', async () => {
      // Mock database responses - first query returns null (no explicit setting)
      mockFirst.mockResolvedValueOnce(null);
      // Second query returns tenant's subscription plan
      mockFirst.mockResolvedValueOnce({ subscription_plan: 'premium' });
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'premium_feature');
      
      expect(result).toBe(true);
      expect(mockPrepare).toHaveBeenCalledWith(
        'SELECT subscription_plan FROM tenants WHERE id = ?'
      );
      expect(mockBind).toHaveBeenCalledWith('tenant123');
    });

    it('should return false when tenant does not have access to feature based on plan', async () => {
      // Mock database responses - first query returns null (no explicit setting)
      mockFirst.mockResolvedValueOnce(null);
      // Second query returns tenant's subscription plan
      mockFirst.mockResolvedValueOnce({ subscription_plan: 'basic' });
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'premium_feature');
      
      expect(result).toBe(false);
    });

    it('should return false when tenant is not found', async () => {
      // Mock database responses - first query returns null (no explicit setting)
      mockFirst.mockResolvedValueOnce(null);
      // Second query also returns null (tenant not found)
      mockFirst.mockResolvedValueOnce(null);
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'basic_feature');
      
      expect(result).toBe(false);
    });

    it('should return false when an error occurs during database query', async () => {
      // Mock database error
      mockBind.mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const result = await checkFeatureAccess(mockEnv, 'tenant123', 'premium_feature');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});