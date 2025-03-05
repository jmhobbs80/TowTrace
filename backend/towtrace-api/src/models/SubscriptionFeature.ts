import { z } from 'zod';

// Available features in the system
export const AVAILABLE_FEATURES = [
  'vin_scanning',
  'gps_tracking',
  'job_management',
  'fleet_management',
  'inspection_reports',
  'quickbooks_integration',
  'storage_tracking',
  'eld_integration',
  'advanced_analytics',
  'multi_tenant_access',
  'ai_insights',
  'advanced_routing',
  'customer_portal',
  'law_enforcement_tools',
  'driver_document_wallet',           // Driver document storage feature
  'document_expiration_tracking',     // Document expiration tracking and notifications
  'realtime_gps_tracking'             // Enhanced real-time GPS tracking (1-3 second refresh)
] as const;

// SubscriptionFeature Schema for validation
export const SubscriptionFeatureSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  feature_name: z.enum(AVAILABLE_FEATURES),
  is_enabled: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type SubscriptionFeature = z.infer<typeof SubscriptionFeatureSchema>;

// Schema for creating a new subscription feature
export const CreateSubscriptionFeatureSchema = SubscriptionFeatureSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Type for creating a new subscription feature
export type CreateSubscriptionFeature = z.infer<typeof CreateSubscriptionFeatureSchema>;

// Schema for updating a subscription feature
export const UpdateSubscriptionFeatureSchema = SubscriptionFeatureSchema.pick({ 
  is_enabled: true 
});

// Type for updating a subscription feature
export type UpdateSubscriptionFeature = z.infer<typeof UpdateSubscriptionFeatureSchema>;

// Default features by subscription plan
export const DEFAULT_FEATURES = {
  basic: [
    'vin_scanning',
    'gps_tracking',
    'job_management',
    'fleet_management',
    'inspection_reports',
    'driver_document_wallet',           // Available for all plans
  ],
  premium: [
    'vin_scanning',
    'gps_tracking',
    'job_management',
    'fleet_management',
    'inspection_reports',
    'quickbooks_integration',
    'storage_tracking',
    'eld_integration',
    'advanced_analytics',
    'driver_document_wallet',           // Available for all plans
    'document_expiration_tracking',     // Premium and above
    'realtime_gps_tracking',            // Premium and above
  ],
  enterprise: [
    'vin_scanning',
    'gps_tracking',
    'job_management',
    'fleet_management',
    'inspection_reports',
    'quickbooks_integration',
    'storage_tracking',
    'eld_integration',
    'advanced_analytics',
    'multi_tenant_access',
    'ai_insights',
    'advanced_routing',
    'customer_portal',
    'law_enforcement_tools',
    'driver_document_wallet',           // Available for all plans
    'document_expiration_tracking',     // Premium and above
    'realtime_gps_tracking',            // Premium and above
  ],
};