/**
 * Unit tests for Hours of Service model schemas
 */

import { 
  HoursOfServiceSchema, 
  CreateHoursOfServiceSchema, 
  UpdateHoursOfServiceSchema,
  HosSummarySchema
} from './HoursOfService';

describe('Hours of Service Model', () => {
  // Valid test data
  const validHosData = {
    id: 'e8c21f8a-1c8d-4f8d-9c3d-3c7f9e2d1a8b',
    driver_id: 'a9d87e6f-5c4b-3a2d-1e0f-8c7b6a5d4e3f',
    vehicle_id: 'b8c7d6e5-f4e3-2d1c-0b9a-8c7d6e5f4e3d',
    eld_device_id: 'c7d6e5f4-e3d2-1c0b-9a8c-7d6e5f4e3d2c',
    status: 'driving' as const,
    start_time: '2025-03-08T10:00:00Z',
    end_time: '2025-03-08T12:30:00Z',
    duration_minutes: 150,
    tenant_id: 'd6e5f4e3-d2c1-0b9a-8c7d-6e5f4e3d2c1b',
    created_at: '2025-03-08T10:00:00Z',
    updated_at: '2025-03-08T12:30:00Z'
  };

  describe('HoursOfServiceSchema', () => {
    it('should validate valid HOS data', () => {
      const result = HoursOfServiceSchema.safeParse(validHosData);
      expect(result.success).toBe(true);
    });

    it('should allow null end_time and duration_minutes', () => {
      const data = {
        ...validHosData,
        end_time: null,
        duration_minutes: null
      };
      const result = HoursOfServiceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail when id is not a valid UUID', () => {
      const data = {
        ...validHosData,
        id: 'invalid-uuid'
      };
      const result = HoursOfServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('id');
      }
    });

    it('should fail when status is not valid', () => {
      const data = {
        ...validHosData,
        status: 'invalid_status'
      };
      const result = HoursOfServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('status');
      }
    });

    it('should fail when start_time is not a valid ISO datetime', () => {
      const data = {
        ...validHosData,
        start_time: 'invalid-date'
      };
      const result = HoursOfServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('start_time');
      }
    });

    it('should fail when duration_minutes is negative', () => {
      const data = {
        ...validHosData,
        duration_minutes: -10
      };
      const result = HoursOfServiceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('duration_minutes');
      }
    });

    it('should fail when required fields are missing', () => {
      const incompleteData = {
        id: validHosData.id,
        // Missing driver_id, vehicle_id, etc.
        status: validHosData.status,
        start_time: validHosData.start_time
      };
      const result = HoursOfServiceSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateHoursOfServiceSchema', () => {
    it('should validate valid creation data', () => {
      const createData = {
        driver_id: validHosData.driver_id,
        vehicle_id: validHosData.vehicle_id,
        eld_device_id: validHosData.eld_device_id,
        status: validHosData.status,
        start_time: validHosData.start_time,
        tenant_id: validHosData.tenant_id
      };
      const result = CreateHoursOfServiceSchema.safeParse(createData);
      expect(result.success).toBe(true);
    });

    it('should fail when creation data includes id', () => {
      const createData = {
        id: validHosData.id, // Should be omitted
        driver_id: validHosData.driver_id,
        vehicle_id: validHosData.vehicle_id,
        eld_device_id: validHosData.eld_device_id,
        status: validHosData.status,
        start_time: validHosData.start_time,
        tenant_id: validHosData.tenant_id
      };
      const result = CreateHoursOfServiceSchema.safeParse(createData);
      expect(result.success).toBe(false);
    });

    it('should fail when creation data includes end_time', () => {
      const createData = {
        driver_id: validHosData.driver_id,
        vehicle_id: validHosData.vehicle_id,
        eld_device_id: validHosData.eld_device_id,
        status: validHosData.status,
        start_time: validHosData.start_time,
        tenant_id: validHosData.tenant_id,
        end_time: validHosData.end_time // Should be omitted
      };
      const result = CreateHoursOfServiceSchema.safeParse(createData);
      expect(result.success).toBe(false);
    });

    it('should fail when required creation fields are missing', () => {
      const incompleteData = {
        driver_id: validHosData.driver_id,
        // Missing vehicle_id, eld_device_id
        status: validHosData.status,
        start_time: validHosData.start_time,
        tenant_id: validHosData.tenant_id
      };
      const result = CreateHoursOfServiceSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateHoursOfServiceSchema', () => {
    it('should validate minimal update data', () => {
      const updateData = {
        status: 'off_duty' as const
      };
      const result = UpdateHoursOfServiceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate comprehensive update data', () => {
      const updateData = {
        status: 'off_duty' as const,
        end_time: '2025-03-08T14:00:00Z',
        duration_minutes: 240
      };
      const result = UpdateHoursOfServiceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should fail when update includes invalid status', () => {
      const updateData = {
        status: 'invalid_status'
      };
      const result = UpdateHoursOfServiceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should fail when update includes negative duration', () => {
      const updateData = {
        duration_minutes: -30
      };
      const result = UpdateHoursOfServiceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should fail when update includes invalid datetime', () => {
      const updateData = {
        end_time: 'not-a-date'
      };
      const result = UpdateHoursOfServiceSchema.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should allow empty update object (no changes)', () => {
      const emptyUpdate = {};
      const result = UpdateHoursOfServiceSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('HosSummarySchema', () => {
    it('should validate valid HOS summary data', () => {
      const summaryData = {
        driver_id: validHosData.driver_id,
        driver_name: 'John Doe',
        total_driving_minutes: 360,
        total_on_duty_minutes: 480,
        total_off_duty_minutes: 480,
        total_sleeping_minutes: 480,
        remaining_drive_time_minutes: 300,
        remaining_duty_time_minutes: 420,
        on_break: false,
        violations: [
          {
            type: 'break' as const,
            description: 'No 30-minute break after 8 hours',
            timestamp: '2025-03-08T18:00:00Z'
          }
        ],
        current_status: 'driving' as const,
        current_status_start_time: '2025-03-08T16:00:00Z'
      };
      const result = HosSummarySchema.safeParse(summaryData);
      expect(result.success).toBe(true);
    });

    it('should validate summary without optional fields', () => {
      const minimalSummary = {
        driver_id: validHosData.driver_id,
        total_driving_minutes: 360,
        total_on_duty_minutes: 480,
        total_off_duty_minutes: 480,
        total_sleeping_minutes: 480,
        remaining_drive_time_minutes: 300,
        remaining_duty_time_minutes: 420,
        on_break: false,
        current_status: 'driving' as const,
        current_status_start_time: '2025-03-08T16:00:00Z'
      };
      const result = HosSummarySchema.safeParse(minimalSummary);
      expect(result.success).toBe(true);
    });

    it('should fail when summary has invalid violation type', () => {
      const summaryData = {
        driver_id: validHosData.driver_id,
        total_driving_minutes: 360,
        total_on_duty_minutes: 480,
        total_off_duty_minutes: 480,
        total_sleeping_minutes: 480,
        remaining_drive_time_minutes: 300,
        remaining_duty_time_minutes: 420,
        on_break: false,
        violations: [
          {
            type: 'invalid_type', // Invalid enum value
            description: 'Violation description',
            timestamp: '2025-03-08T18:00:00Z'
          }
        ],
        current_status: 'driving' as const,
        current_status_start_time: '2025-03-08T16:00:00Z'
      };
      const result = HosSummarySchema.safeParse(summaryData);
      expect(result.success).toBe(false);
    });

    it('should fail when required summary fields are missing', () => {
      const incompleteSummary = {
        driver_id: validHosData.driver_id,
        // Missing total_driving_minutes and other required fields
        current_status: 'driving' as const,
        current_status_start_time: '2025-03-08T16:00:00Z'
      };
      const result = HosSummarySchema.safeParse(incompleteSummary);
      expect(result.success).toBe(false);
    });

    it('should allow negative remaining drive time (indicating violation)', () => {
      const summaryWithViolation = {
        driver_id: validHosData.driver_id,
        total_driving_minutes: 720, // 12 hours of driving
        total_on_duty_minutes: 840,
        total_off_duty_minutes: 480,
        total_sleeping_minutes: 120,
        remaining_drive_time_minutes: -120, // 2 hours over limit
        remaining_duty_time_minutes: -60,
        on_break: false,
        current_status: 'driving' as const,
        current_status_start_time: '2025-03-08T16:00:00Z'
      };
      const result = HosSummarySchema.safeParse(summaryWithViolation);
      expect(result.success).toBe(true);
    });
  });
});