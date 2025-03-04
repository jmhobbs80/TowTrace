import { DateTime, Str } from "chanfana";
import { z } from "zod";
import { D1Database } from '@cloudflare/workers-types';

// Original Task schema
export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});

// Environment interface
export interface Env {
  DB: D1Database;
  QUICKBOOKS_CLIENT_ID?: string;
  QUICKBOOKS_CLIENT_SECRET?: string;
  JWT_SECRET: string;
}

// Auth token payload
export interface TokenPayload {
  userId: string;
  role: string;
  tenantId: string;
  exp: number;
  iat: number;
}

// Subscription plans
export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

// Billing cycles
export type BillingCycle = 'monthly' | 'yearly';

// Payment status
export type PaymentStatus = 'active' | 'past_due' | 'canceled';

// User roles
export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'manager' | 'system_admin' | 'client_admin';

// ELD device status
export type EldDeviceStatus = 'active' | 'inactive' | 'maintenance';

// Hours of service status
export type HosStatus = 'on_duty' | 'off_duty' | 'driving' | 'sleeping';

// Payment status
export type PaymentTransactionStatus = 'success' | 'failed' | 'pending' | 'refunded';

// Available API endpoints by subscription level
export const SUBSCRIPTION_ENDPOINTS = {
  basic: [
    '/api/auth/*',
    '/api/vehicles/*',
    '/api/drivers/*',
    '/api/jobs/*',
    '/api/tracking/*',
    '/api/inspections/*',
  ],
  premium: [
    '/api/auth/*',
    '/api/vehicles/*',
    '/api/drivers/*',
    '/api/jobs/*',
    '/api/tracking/*',
    '/api/inspections/*',
    '/api/quickbooks/*',
    '/api/storage/*',
    '/api/eld/*',
    '/api/analytics/basic/*',
  ],
  enterprise: [
    '/api/auth/*',
    '/api/vehicles/*',
    '/api/drivers/*',
    '/api/jobs/*',
    '/api/tracking/*',
    '/api/inspections/*',
    '/api/quickbooks/*',
    '/api/storage/*',
    '/api/eld/*',
    '/api/analytics/*',
    '/api/multi-tenant/*',
    '/api/ai/*',
    '/api/advanced-routing/*',
    '/api/customer-portal/*',
    '/api/law-enforcement/*',
  ],
};

// Error responses
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}