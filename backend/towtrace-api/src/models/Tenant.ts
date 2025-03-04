import { z } from 'zod';

// Tenant Schema for validation
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'yearly']),
  payment_status: z.enum(['active', 'past_due', 'canceled']),
  tow_trace_id: z.string().min(1),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type Tenant = z.infer<typeof TenantSchema>;

// Schema for creating a new tenant
export const CreateTenantSchema = TenantSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Type for creating a new tenant
export type CreateTenant = z.infer<typeof CreateTenantSchema>;

// Schema for updating a tenant
export const UpdateTenantSchema = TenantSchema.partial().omit({ 
  id: true, 
  created_at: true,
  updated_at: true,
  tow_trace_id: true 
});

// Type for updating a tenant
export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;

// Tenant response schema (what is returned to the client)
export const TenantResponseSchema = TenantSchema.extend({});

// Type for tenant response
export type TenantResponse = z.infer<typeof TenantResponseSchema>;