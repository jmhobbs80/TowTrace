import { Env } from '../types';
import { Request } from '@cloudflare/workers-types';
import { requireAuth, checkRole } from '../middlewares/auth';
import { Tenant, CreateTenant, UpdateTenant } from '../models/Tenant';
import { CreateUser } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_FEATURES } from '../models/SubscriptionFeature';

/**
 * Create a new tenant with subscription
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with the created tenant or error
 */
export async function createTenant(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Verify JWT and check if user is a system admin
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to create tenants',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Parse request body
    const requestData = await request.json() as CreateTenant;
    
    // Generate a unique TowTrace ID (TowTraceID#1234)
    const lastTenantResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM tenants'
    ).first<{ count: number }>();
    
    const count = lastTenantResult?.count || 0;
    const towTraceId = `TowTraceID#${count + 1000 + 1}`; // Start from 1000 for better presentation
    
    // Create a new tenant ID
    const tenantId = uuidv4();
    
    // Insert the new tenant
    await env.DB.prepare(
      `INSERT INTO tenants (
        id, name, subscription_plan, billing_cycle, payment_status, tow_trace_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      tenantId,
      requestData.name,
      requestData.subscription_plan,
      requestData.billing_cycle,
      requestData.payment_status,
      towTraceId
    ).run();
    
    // Create the admin user for this tenant
    if (requestData.admin_email) {
      const adminId = uuidv4();
      await env.DB.prepare(
        `INSERT INTO users (
          id, email, role, tenant_id, updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'))`
      ).bind(
        adminId,
        requestData.admin_email,
        'client_admin',
        tenantId
      ).run();
    }
    
    // Set up default features based on subscription plan
    const features = DEFAULT_FEATURES[requestData.subscription_plan as keyof typeof DEFAULT_FEATURES] || [];
    
    for (const feature of features) {
      await env.DB.prepare(
        `INSERT INTO subscription_features (
          id, tenant_id, feature_name, is_enabled, updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'))`
      ).bind(
        uuidv4(),
        tenantId,
        feature,
        true
      ).run();
    }
    
    // Fetch the created tenant
    const tenant = await env.DB.prepare(
      'SELECT * FROM tenants WHERE id = ?'
    ).bind(tenantId).first<Tenant>();
    
    return new Response(JSON.stringify(tenant), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to create tenant',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Update an existing tenant subscription
 * @param request - The HTTP request
 * @param env - Environment variables
 * @param tenantId - The tenant ID to update
 * @returns Response with the updated tenant or error
 */
export async function updateTenant(
  request: Request,
  env: Env,
  tenantId: string
): Promise<Response> {
  try {
    // Verify JWT and check if user is a system admin
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin', 'client_admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to update tenants',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Client admins can only update their own tenant
    if (tokenPayload.role === 'client_admin' && tokenPayload.tenantId !== tenantId) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You can only update your own tenant',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Parse request body
    const requestData = await request.json() as UpdateTenant;
    
    // Check if tenant exists
    const existingTenant = await env.DB.prepare(
      'SELECT * FROM tenants WHERE id = ?'
    ).bind(tenantId).first<Tenant>();
    
    if (!existingTenant) {
      return new Response(JSON.stringify({
        error: 'NotFound',
        message: 'Tenant not found',
        status: 404
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE tenants SET updated_at = datetime(\'now\')';
    const params: any[] = [];
    
    if (requestData.name) {
      updateQuery += ', name = ?';
      params.push(requestData.name);
    }
    
    if (requestData.subscription_plan) {
      updateQuery += ', subscription_plan = ?';
      params.push(requestData.subscription_plan);
    }
    
    if (requestData.billing_cycle) {
      updateQuery += ', billing_cycle = ?';
      params.push(requestData.billing_cycle);
    }
    
    if (requestData.payment_status) {
      updateQuery += ', payment_status = ?';
      params.push(requestData.payment_status);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(tenantId);
    
    // Execute the update
    await env.DB.prepare(updateQuery).bind(...params).run();
    
    // If subscription plan changed, update features
    if (requestData.subscription_plan && requestData.subscription_plan !== existingTenant.subscription_plan) {
      // Disable all features first
      await env.DB.prepare(
        'UPDATE subscription_features SET is_enabled = false, updated_at = datetime(\'now\') WHERE tenant_id = ?'
      ).bind(tenantId).run();
      
      // Enable features for the new plan
      const features = DEFAULT_FEATURES[requestData.subscription_plan as keyof typeof DEFAULT_FEATURES] || [];
      
      for (const feature of features) {
        // Check if feature exists
        const existingFeature = await env.DB.prepare(
          'SELECT id FROM subscription_features WHERE tenant_id = ? AND feature_name = ?'
        ).bind(tenantId, feature).first<{ id: string }>();
        
        if (existingFeature) {
          // Update existing feature
          await env.DB.prepare(
            'UPDATE subscription_features SET is_enabled = true, updated_at = datetime(\'now\') WHERE id = ?'
          ).bind(existingFeature.id).run();
        } else {
          // Create new feature
          await env.DB.prepare(
            `INSERT INTO subscription_features (
              id, tenant_id, feature_name, is_enabled, updated_at
            ) VALUES (?, ?, ?, ?, datetime('now'))`
          ).bind(
            uuidv4(),
            tenantId,
            feature,
            true
          ).run();
        }
      }
    }
    
    // Fetch the updated tenant
    const updatedTenant = await env.DB.prepare(
      'SELECT * FROM tenants WHERE id = ?'
    ).bind(tenantId).first<Tenant>();
    
    return new Response(JSON.stringify(updatedTenant), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to update tenant',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get all tenants (for system admins)
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with list of tenants or error
 */
export async function getAllTenants(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Verify JWT and check if user is a system admin
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to view all tenants',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Fetch all tenants
    const tenants = await env.DB.prepare(
      'SELECT * FROM tenants ORDER BY created_at DESC'
    ).all<Tenant>();
    
    return new Response(JSON.stringify(tenants.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch tenants',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get a single tenant by ID
 * @param request - The HTTP request
 * @param env - Environment variables
 * @param tenantId - The tenant ID to fetch
 * @returns Response with the tenant or error
 */
export async function getTenantById(
  request: Request,
  env: Env,
  tenantId: string
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    
    // System admins can view any tenant, others can only view their own
    if (
      !checkRole(tokenPayload, ['system_admin']) && 
      tokenPayload.tenantId !== tenantId
    ) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to view this tenant',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Fetch the tenant
    const tenant = await env.DB.prepare(
      'SELECT * FROM tenants WHERE id = ?'
    ).bind(tenantId).first<Tenant>();
    
    if (!tenant) {
      return new Response(JSON.stringify({
        error: 'NotFound',
        message: 'Tenant not found',
        status: 404
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify(tenant), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch tenant',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}