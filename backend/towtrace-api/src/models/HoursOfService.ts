import { z } from 'zod';

// Hours of Service Schema for validation
export const HoursOfServiceSchema = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  eld_device_id: z.string().uuid(),
  status: z.enum(['on_duty', 'off_duty', 'driving', 'sleeping']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().nonnegative().optional().nullable(),
  tenant_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type HoursOfService = z.infer<typeof HoursOfServiceSchema>;

// Schema for creating a new HOS record
export const CreateHoursOfServiceSchema = HoursOfServiceSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  end_time: true,
  duration_minutes: true
});

// Type for creating a new HOS record
export type CreateHoursOfService = z.infer<typeof CreateHoursOfServiceSchema>;

// Schema for updating an HOS record
export const UpdateHoursOfServiceSchema = z.object({
  status: z.enum(['on_duty', 'off_duty', 'driving', 'sleeping']).optional(),
  end_time: z.string().datetime().optional(),
  duration_minutes: z.number().int().nonnegative().optional(),
});

// Type for updating an HOS record
export type UpdateHoursOfService = z.infer<typeof UpdateHoursOfServiceSchema>;

// HOS summary schema for reports
export const HosSummarySchema = z.object({
  driver_id: z.string().uuid(),
  driver_name: z.string().optional(),
  total_driving_minutes: z.number().int().nonnegative(),
  total_on_duty_minutes: z.number().int().nonnegative(),
  total_off_duty_minutes: z.number().int().nonnegative(),
  total_sleeping_minutes: z.number().int().nonnegative(),
  remaining_drive_time_minutes: z.number().int(),
  remaining_duty_time_minutes: z.number().int(),
  on_break: z.boolean(),
  violations: z.array(z.object({
    type: z.enum(['drive_time', 'duty_time', 'break', 'cycle']),
    description: z.string(),
    timestamp: z.string().datetime(),
  })).optional(),
  current_status: z.enum(['on_duty', 'off_duty', 'driving', 'sleeping']),
  current_status_start_time: z.string().datetime(),
});

// Type for HOS summary data
export type HosSummary = z.infer<typeof HosSummarySchema>;