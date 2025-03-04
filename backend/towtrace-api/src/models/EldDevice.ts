import { z } from 'zod';

// ELD Device Schema for validation
export const EldDeviceSchema = z.object({
  id: z.string().uuid(),
  device_serial: z.string().min(1),
  vehicle_id: z.string().uuid().optional().nullable(),
  tenant_id: z.string().uuid(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  last_ping: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type EldDevice = z.infer<typeof EldDeviceSchema>;

// Schema for creating a new ELD device
export const CreateEldDeviceSchema = EldDeviceSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  last_ping: true
}).extend({
  status: z.enum(['active', 'inactive', 'maintenance']).default('inactive'),
});

// Type for creating a new ELD device
export type CreateEldDevice = z.infer<typeof CreateEldDeviceSchema>;

// Schema for updating an ELD device
export const UpdateEldDeviceSchema = z.object({
  vehicle_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
});

// Type for updating an ELD device
export type UpdateEldDevice = z.infer<typeof UpdateEldDeviceSchema>;

// ELD device telemetry data schema
export const EldTelemetrySchema = z.object({
  device_serial: z.string().min(1),
  timestamp: z.string().datetime(),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number(),
  engine_status: z.enum(['on', 'off']),
  hours_of_service_status: z.enum(['on_duty', 'off_duty', 'driving', 'sleeping']),
  diagnostic_data: z.record(z.string(), z.any()).optional(),
});

// Type for ELD telemetry data
export type EldTelemetry = z.infer<typeof EldTelemetrySchema>;