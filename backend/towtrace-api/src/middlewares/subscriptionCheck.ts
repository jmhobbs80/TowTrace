import { Env, TokenPayload, SUBSCRIPTION_ENDPOINTS } from '../types';
import { Request } from '@cloudflare/workers-types';

/**
 * Middleware to check if a tenant has access to a specific endpoint based on their subscription plan
 * @param request - The HTTP request
 * @param env - Environment variables
 * @param tokenPayload - Decoded JWT token payload with user information
 * @returns Boolean indicating if the tenant has access or null if no token payload provided
 */
export async function checkSubscriptionAccess(
  request: Request,
  env: Env,
  tokenPayload?: TokenPayload
): Promise<boolean | null> {
  // If no token payload, we can't check subscription (likely a public route)
  if (!tokenPayload) {
    return null;
  }

  try {
    const { tenantId } = tokenPayload;
    const url = new URL(request.url);
    const path = url.pathname;

    // System admins bypass subscription checks
    if (tokenPayload.role === 'system_admin') {
      return true;
    }

    // Get tenant information from database
    const tenantResult = await env.DB.prepare(
      'SELECT subscription_plan FROM tenants WHERE id = ?'
    )
      .bind(tenantId)
      .first<{ subscription_plan: string }>();

    if (!tenantResult) {
      return false; // Tenant not found
    }

    const { subscription_plan } = tenantResult;

    // Get the allowed endpoints for this subscription plan
    const allowedEndpoints = SUBSCRIPTION_ENDPOINTS[subscription_plan as keyof typeof SUBSCRIPTION_ENDPOINTS] || [];

    // Check if the requested path is allowed
    return allowedEndpoints.some(endpoint => {
      // Convert endpoint pattern to regex
      const pattern = endpoint.replace(/\/\*/g, '(\\/.*)?');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return false;
  }
}

/**
 * Middleware to check if a tenant has access to a specific feature based on their subscription
 * @param env - Environment variables
 * @param tenantId - The tenant ID
 * @param featureName - The feature to check
 * @returns Boolean indicating if the tenant has access to the feature
 */
export async function checkFeatureAccess(
  env: Env,
  tenantId: string,
  featureName: string
): Promise<boolean> {
  try {
    // Check if the feature is explicitly enabled for this tenant
    const featureResult = await env.DB.prepare(
      'SELECT is_enabled FROM subscription_features WHERE tenant_id = ? AND feature_name = ?'
    )
      .bind(tenantId, featureName)
      .first<{ is_enabled: number }>();

    // If feature record exists, return its enabled status
    if (featureResult) {
      return featureResult.is_enabled === 1;
    }

    // If no explicit record, check the subscription plan default features
    const tenantResult = await env.DB.prepare(
      'SELECT subscription_plan FROM tenants WHERE id = ?'
    )
      .bind(tenantId)
      .first<{ subscription_plan: string }>();

    if (!tenantResult) {
      return false; // Tenant not found
    }

    // Import feature defaults dynamically to avoid circular dependencies
    const { DEFAULT_FEATURES } = await import('../models/SubscriptionFeature');
    
    const { subscription_plan } = tenantResult;
    const planFeatures = DEFAULT_FEATURES[subscription_plan as keyof typeof DEFAULT_FEATURES] || [];
    
    return planFeatures.includes(featureName as any);
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}