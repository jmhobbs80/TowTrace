import { Env } from '../types';
import { Request } from '@cloudflare/workers-types';
import { requireAuth, checkRole } from '../middlewares/auth';
import { checkFeatureAccess } from '../middlewares/subscriptionCheck';
import { CreateSubscriptionPayment, UpdateSubscriptionPayment, SUBSCRIPTION_PRICING } from '../models/SubscriptionPayment';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new subscription payment
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with the created payment or error
 */
export async function createPayment(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin', 'client_admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to create subscription payments',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Parse request body
    const requestData = await request.json() as CreateSubscriptionPayment;
    
    // Ensure tenant ID matches the authenticated user's tenant (unless system admin)
    if (tokenPayload.role !== 'system_admin' && requestData.tenant_id !== tokenPayload.tenantId) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You can only create payments for your own tenant',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Create a new payment ID
    const paymentId = uuidv4();
    
    // Insert the new payment
    await env.DB.prepare(
      `INSERT INTO subscription_payments (
        id, tenant_id, amount, payment_date, payment_method, transaction_id, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      paymentId,
      requestData.tenant_id,
      requestData.amount,
      requestData.payment_date,
      requestData.payment_method || null,
      requestData.transaction_id || null,
      requestData.status
    ).run();
    
    // If payment is successful, update tenant payment status
    if (requestData.status === 'success') {
      await env.DB.prepare(
        'UPDATE tenants SET payment_status = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind('active', requestData.tenant_id).run();
    }
    
    // If QuickBooks integration is enabled, sync with QuickBooks
    const hasQuickbooksAccess = await checkFeatureAccess(env, requestData.tenant_id, 'quickbooks_integration');
    if (hasQuickbooksAccess && (requestData.status === 'success' || requestData.status === 'pending')) {
      try {
        // Simulate QuickBooks integration (in a real implementation, this would make API calls to QuickBooks)
        const quickbooksInvoiceId = `QB-${Math.floor(Math.random() * 10000000)}`;
        
        // Update the payment with QuickBooks invoice ID
        await env.DB.prepare(
          'UPDATE subscription_payments SET quickbooks_invoice_id = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(quickbooksInvoiceId, paymentId).run();
      } catch (qbError) {
        console.error('Error syncing with QuickBooks:', qbError);
        // Continue without failing the entire operation
      }
    }
    
    // Fetch the created payment
    const payment = await env.DB.prepare(
      'SELECT * FROM subscription_payments WHERE id = ?'
    ).bind(paymentId).first();
    
    return new Response(JSON.stringify(payment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating subscription payment:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to create subscription payment',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get subscription payments for a tenant
 * @param request - The HTTP request
 * @param env - Environment variables
 * @param tenantId - The tenant ID to fetch payments for
 * @returns Response with list of payments or error
 */
export async function getTenantPayments(
  request: Request,
  env: Env,
  tenantId: string
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    
    // Ensure user has permission to view these payments
    if (
      !checkRole(tokenPayload, ['system_admin']) && 
      (tokenPayload.role !== 'client_admin' || tokenPayload.tenantId !== tenantId)
    ) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to view these subscription payments',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Fetch payments for the tenant
    const payments = await env.DB.prepare(
      'SELECT * FROM subscription_payments WHERE tenant_id = ? ORDER BY payment_date DESC'
    ).bind(tenantId).all();
    
    return new Response(JSON.stringify(payments.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching subscription payments:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch subscription payments',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get subscription pricing information
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with pricing information
 */
export async function getPricingInfo(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // This endpoint is public, no authentication required
    return new Response(JSON.stringify({
      pricing: SUBSCRIPTION_PRICING,
      features: {
        basic: [
          'Multi-vehicle VIN scanning',
          'Basic GPS tracking',
          'Job management',
          'Fleet management',
          'Pre-trip inspections',
        ],
        premium: [
          'All Basic features',
          'QuickBooks integration',
          'Temporary storage tracking',
          'ELD device integration',
          'Advanced analytics',
          'Enhanced GPS tracking',
        ],
        enterprise: [
          'All Premium features',
          'Multi-tenant access',
          'AI-driven insights',
          'Advanced routing',
          'Customer portal',
          'Law enforcement tools',
          'Financial reporting',
          'Driver safety coaching',
        ]
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching pricing information:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch pricing information',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}