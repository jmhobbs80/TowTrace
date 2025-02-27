// File: src/types/index.ts

// Auth and User Types
export interface User {
  id: string;
  email: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
}

export interface UserDetails {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  settings?: Record<string, any>;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'driver' | 'dealer';

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  primary_color?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  tenant_id: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  license_plate?: string;
  status: VehicleStatus;
  details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type VehicleStatus = 'active' | 'maintenance' | 'out_of_service';

export interface MaintenanceRecord {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  performed_by?: string;
  user?: UserDetails;
  type: string;
  description: string;
  cost?: number;
  odometer?: number;
  performed_at: string;
  next_due_date?: string;
  next_due_mileage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Customer Types
export interface Customer {
  id: string;
  tenant_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Job Types
export interface Job {
  id: string;
  tenant_id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  vehicle_id?: string;
  vehicle?: Vehicle;
  driver_id?: string;
  driver?: UserDetails;
  pickup_location?: any; // Geography point
  pickup_address: string;
  destination_location?: any; // Geography point
  destination_address?: string;
  requested_time?: string;
  estimated_arrival_time?: string;
  actual_arrival_time?: string;
  completion_time?: string;
  status: JobStatus;
  payment_status?: PaymentStatus;
  price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type JobStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface NewJob {
  tenant_id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  vehicle_id?: string;
  driver_id?: string;
  pickup_address: string;
  destination_address?: string;
  requested_time?: string;
  status: JobStatus;
  notes?: string;
}

export interface JobUpdate {
  id?: string;
  tenant_id?: string;
  job_id: string;
  user_id: string;
  previous_status?: string;
  new_status: string;
  notes?: string;
  location?: any; // Geography point
  created_at?: string;
  user?: UserDetails;
}

// Notification Types
export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  type: string;
  created_at: string;
}