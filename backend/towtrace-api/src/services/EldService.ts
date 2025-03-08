import { Env } from '../types';
import { EldDevice, EldTelemetry } from '../models/EldDevice';
import { HoursOfService, HosSummary } from '../models/HoursOfService';
import { checkFeatureAccess } from '../middlewares/subscriptionCheck';

/**
 * Service for ELD-related functionality
 */
export class EldService {
  /**
   * Check if a tenant has ELD features enabled
   * @param env - Environment variables
   * @param tenantId - Tenant ID to check
   * @returns Boolean indicating if ELD features are available
   */
  static async hasEldAccess(env: Env, tenantId: string): Promise<boolean> {
    return await checkFeatureAccess(env, tenantId, 'eld_integration');
  }
  
  /**
   * Get ELD devices for a tenant
   * @param env - Environment variables
   * @param tenantId - Tenant ID to get devices for
   * @returns Array of ELD devices
   */
  static async getDevicesForTenant(env: Env, tenantId: string): Promise<EldDevice[]> {
    const devices = await env.DB.prepare(
      'SELECT * FROM eld_devices WHERE tenant_id = ? ORDER BY created_at DESC'
    ).bind(tenantId).all<EldDevice>();
    
    return devices.results;
  }
  
  /**
   * Get a specific ELD device by ID
   * @param env - Environment variables
   * @param deviceId - Device ID to fetch
   * @returns The ELD device or null if not found
   */
  static async getDeviceById(env: Env, deviceId: string): Promise<EldDevice | null> {
    const device = await env.DB.prepare(
      'SELECT * FROM eld_devices WHERE id = ?'
    ).bind(deviceId).first<EldDevice>();
    
    return device || null;
  }
  
  /**
   * Get a summary of hours of service for a driver
   * @param env - Environment variables
   * @param driverId - Driver ID to get HOS summary for
   * @returns HOS summary data
   */
  static async getDriverHosSummary(env: Env, driverId: string): Promise<HosSummary | null> {
    // Get the driver's info
    const driver = await env.DB.prepare(
      'SELECT id, tenant_id, email as name FROM users WHERE id = ?'
    ).bind(driverId).first<{ id: string, tenant_id: string, name: string }>();
    
    if (!driver) {
      return null;
    }
    
    // Check if the tenant has ELD access
    const hasAccess = await this.hasEldAccess(env, driver.tenant_id);
    if (!hasAccess) {
      return null;
    }
    
    // Get current HOS status
    const currentStatus = await env.DB.prepare(
      `SELECT status, start_time FROM eld_hours_of_service 
       WHERE driver_id = ? AND end_time IS NULL
       ORDER BY start_time DESC LIMIT 1`
    ).bind(driverId).first<{ status: string, start_time: string }>();
    
    // Calculate total minutes in each status for the last 24 hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 24);
    
    const timeResults = await env.DB.prepare(
      `SELECT 
         status, 
         SUM(duration_minutes) as total_minutes
       FROM eld_hours_of_service
       WHERE driver_id = ?
       AND start_time >= ?
       AND duration_minutes IS NOT NULL
       GROUP BY status`
    ).bind(driverId, startTime.toISOString()).all<{ status: string, total_minutes: number }>();
    
    // Organize the results
    const timeByStatus: Record<string, number> = {
      driving: 0,
      on_duty: 0,
      off_duty: 0,
      sleeping: 0
    };
    
    timeResults.results.forEach(result => {
      timeByStatus[result.status] = result.total_minutes;
    });
    
    // Check for violations
    const violations: { type: string, description: string, timestamp: string }[] = [];
    
    // Example violation check: driving time > 11 hours
    const maxDrivingMinutes = 11 * 60;
    if (timeByStatus.driving > maxDrivingMinutes) {
      violations.push({
        type: 'drive_time',
        description: `Exceeded maximum driving time of 11 hours (${Math.floor(timeByStatus.driving / 60)} hours ${timeByStatus.driving % 60} minutes)`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate remaining time
    const remainingDriveMinutes = Math.max(0, maxDrivingMinutes - timeByStatus.driving);
    const remainingDutyMinutes = Math.max(0, 14 * 60 - (timeByStatus.driving + timeByStatus.on_duty));
    
    // Build the summary
    const summary: HosSummary = {
      driver_id: driverId,
      driver_name: driver.name,
      total_driving_minutes: timeByStatus.driving,
      total_on_duty_minutes: timeByStatus.on_duty,
      total_off_duty_minutes: timeByStatus.off_duty,
      total_sleeping_minutes: timeByStatus.sleeping,
      remaining_drive_time_minutes: remainingDriveMinutes,
      remaining_duty_time_minutes: remainingDutyMinutes,
      on_break: currentStatus?.status === 'off_duty' || currentStatus?.status === 'sleeping',
      violations: violations.length > 0 ? violations : undefined,
      current_status: (currentStatus?.status as any) || 'off_duty',
      current_status_start_time: currentStatus?.start_time || new Date().toISOString()
    };
    
    return summary;
  }
  
  /**
   * Get ELD analytics for a tenant
   * This is an Enterprise feature that provides advanced analysis
   * @param env - Environment variables
   * @param tenantId - Tenant ID to get analytics for
   * @returns Analytics data
   */
  static async getEldAnalytics(env: Env, tenantId: string): Promise<any> {
    // Check for enterprise access
    const hasAccess = await checkFeatureAccess(env, tenantId, 'advanced_analytics');
    if (!hasAccess) {
      throw new Error('ELD analytics requires Enterprise subscription');
    }
    
    // Get HOS data for all drivers in the tenant for the last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const hosData = await env.DB.prepare(
      `SELECT 
         driver_id,
         status,
         SUM(duration_minutes) as total_minutes
       FROM eld_hours_of_service
       WHERE tenant_id = ?
       AND start_time >= ?
       AND duration_minutes IS NOT NULL
       GROUP BY driver_id, status`
    ).bind(tenantId, startDate.toISOString()).all();
    
    // Get violation counts
    const violationCounts = await env.DB.prepare(
      `WITH violations AS (
         SELECT 
           driver_id,
           (CASE 
              WHEN status = 'driving' AND duration_minutes > 660 THEN 'drive_time'
              WHEN status IN ('driving', 'on_duty') AND duration_minutes > 840 THEN 'duty_time'
              ELSE NULL
            END) as violation_type
         FROM eld_hours_of_service
         WHERE tenant_id = ?
         AND start_time >= ?
         AND end_time IS NOT NULL
       )
       SELECT 
         driver_id,
         violation_type,
         COUNT(*) as count
       FROM violations
       WHERE violation_type IS NOT NULL
       GROUP BY driver_id, violation_type`
    ).bind(tenantId, startDate.toISOString()).all();
    
    // Format the analytics data
    return {
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      hos_data: hosData.results,
      violations: violationCounts.results,
      summary: {
        // Calculate summary statistics here
        total_drivers: new Set(hosData.results.map((r: any) => r.driver_id)).size,
        total_violations: violationCounts.results.reduce((sum: number, r: any) => sum + r.count, 0),
        // Additional AI-driven insights would be added here in a real implementation
      }
    };
  }
}