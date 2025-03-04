import { z } from 'zod';

// Subscription Payment Schema for validation
export const SubscriptionPaymentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_date: z.string().datetime(),
  payment_method: z.string().optional(),
  transaction_id: z.string().optional(),
  status: z.enum(['success', 'failed', 'pending', 'refunded']),
  quickbooks_invoice_id: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type SubscriptionPayment = z.infer<typeof SubscriptionPaymentSchema>;

// Schema for creating a new subscription payment
export const CreateSubscriptionPaymentSchema = SubscriptionPaymentSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Type for creating a new subscription payment
export type CreateSubscriptionPayment = z.infer<typeof CreateSubscriptionPaymentSchema>;

// Schema for updating a subscription payment
export const UpdateSubscriptionPaymentSchema = z.object({
  status: z.enum(['success', 'failed', 'pending', 'refunded']).optional(),
  quickbooks_invoice_id: z.string().optional(),
  transaction_id: z.string().optional(),
});

// Type for updating a subscription payment
export type UpdateSubscriptionPayment = z.infer<typeof UpdateSubscriptionPaymentSchema>;

// Pricing information for different subscription tiers
export const SUBSCRIPTION_PRICING = {
  basic: {
    monthly: 99.99,
    yearly: 999.99,
  },
  premium: {
    monthly: 199.99,
    yearly: 1999.99,
  },
  enterprise: {
    monthly: 299.99,
    yearly: 2999.99,
  }
};