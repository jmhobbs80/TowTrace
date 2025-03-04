import { Env } from '../types';
import { Request } from '@cloudflare/workers-types';
import { requireAuth, checkRole } from '../middlewares/auth';
import { checkFeatureAccess } from '../middlewares/subscriptionCheck';
import { EldDevice, CreateEldDevice, UpdateEldDevice, EldTelemetry } from '../models/EldDevice';
import { CreateHoursOfService, UpdateHoursOfService, HoursOfService } from '../models/HoursOfService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Register a new ELD device
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with the created ELD device or error
 */
export async function registerEldDevice(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin', 'client_admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to register ELD devices',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check if tenant has access to ELD features
    const hasAccess = await checkFeatureAccess(env, tokenPayload.tenantId, 'eld_integration');
    if (!hasAccess) {
      return new Response(JSON.stringify({
        error: 'SubscriptionRequired',
        message: 'ELD integration requires Premium or Enterprise subscription',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Parse request body
    const requestData = await request.json() as CreateEldDevice;
    
    // Ensure tenant ID matches the authenticated user's tenant (unless system admin)
    if (tokenPayload.role !== 'system_admin' && requestData.tenant_id !== tokenPayload.tenantId) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You can only register devices for your own tenant',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check if device serial already exists
    const existingDevice = await env.DB.prepare(
      'SELECT id FROM eld_devices WHERE device_serial = ?'
    ).bind(requestData.device_serial).first<{ id: string }>();
    
    if (existingDevice) {
      return new Response(JSON.stringify({
        error: 'Conflict',
        message: 'Device with this serial number already exists',
        status: 409
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Create a new ELD device ID
    const deviceId = uuidv4();
    
    // Insert the new ELD device
    await env.DB.prepare(
      `INSERT INTO eld_devices (
        id, device_serial, vehicle_id, tenant_id, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      deviceId,
      requestData.device_serial,
      requestData.vehicle_id || null,
      requestData.tenant_id,
      requestData.status || 'inactive'
    ).run();
    
    // Fetch the created ELD device
    const device = await env.DB.prepare(
      'SELECT * FROM eld_devices WHERE id = ?'
    ).bind(deviceId).first<EldDevice>();
    
    return new Response(JSON.stringify(device), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error registering ELD device:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to register ELD device',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Process telemetry data from an ELD device
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with acknowledgment or error
 */
export async function processTelemetry(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse request body
    const telemetryData = await request.json() as EldTelemetry;
    
    // Find the device by serial number
    const device = await env.DB.prepare(
      'SELECT id, tenant_id, vehicle_id FROM eld_devices WHERE device_serial = ?'
    ).bind(telemetryData.device_serial).first<{
      id: string;
      tenant_id: string;
      vehicle_id: string | null;
    }>();
    
    if (!device) {
      return new Response(JSON.stringify({
        error: 'NotFound',
        message: 'ELD device not found',
        status: 404
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Update device last ping
    await env.DB.prepare(
      'UPDATE eld_devices SET last_ping = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(device.id).run();
    
    // If device is associated with a vehicle, update vehicle location
    if (device.vehicle_id) {
      await env.DB.prepare(
        `UPDATE vehicles SET 
          latitude = ?, 
          longitude = ?, 
          last_updated = datetime('now'), 
          updated_at = datetime('now') 
        WHERE id = ?`
      ).bind(
        telemetryData.latitude,
        telemetryData.longitude,
        device.vehicle_id
      ).run();
      
      // Find the driver currently assigned to this vehicle
      const driverAssignment = await env.DB.prepare(
        'SELECT id, driver_id FROM jobs WHERE vehicle_id = ? AND status IN (\'assigned\', \'in_progress\') LIMIT 1'
      ).bind(device.vehicle_id).first<{
        id: string;
        driver_id: string;
      }>();
      
      if (driverAssignment) {
        // Insert tracking location
        await env.DB.prepare(
          `INSERT INTO tracking_locations (
            id, vehicle_id, driver_id, job_id, latitude, longitude, speed, timestamp, tenant_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          uuidv4(),
          device.vehicle_id,
          driverAssignment.driver_id,
          driverAssignment.id,
          telemetryData.latitude,
          telemetryData.longitude,
          telemetryData.speed,
          telemetryData.timestamp,
          device.tenant_id
        ).run();
        
        // Update or create hours of service record
        if (telemetryData.hours_of_service_status) {
          // Find the most recent HOS record for this driver that isn't closed
          const currentHosRecord = await env.DB.prepare(
            `SELECT id, status FROM eld_hours_of_service 
             WHERE driver_id = ? AND end_time IS NULL
             ORDER BY start_time DESC LIMIT 1`
          ).bind(driverAssignment.driver_id).first<{
            id: string;
            status: string;
          }>();
          
          if (currentHosRecord && currentHosRecord.status !== telemetryData.hours_of_service_status) {
            // Status has changed, close the current record
            const endTime = new Date(telemetryData.timestamp).toISOString();
            const startTime = await env.DB.prepare(
              'SELECT start_time FROM eld_hours_of_service WHERE id = ?'
            ).bind(currentHosRecord.id).first<{ start_time: string }>();
            
            if (startTime) {
              const start = new Date(startTime.start_time);
              const end = new Date(endTime);
              const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
              
              await env.DB.prepare(
                `UPDATE eld_hours_of_service SET 
                  end_time = ?, 
                  duration_minutes = ?,
                  updated_at = datetime('now')
                WHERE id = ?`
              ).bind(
                endTime,
                durationMinutes,
                currentHosRecord.id
              ).run();
            }
            
            // Create a new HOS record with the new status
            await env.DB.prepare(
              `INSERT INTO eld_hours_of_service (
                id, driver_id, vehicle_id, eld_device_id, status, start_time, tenant_id, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
            ).bind(
              uuidv4(),
              driverAssignment.driver_id,
              device.vehicle_id,
              device.id,
              telemetryData.hours_of_service_status,
              telemetryData.timestamp,
              device.tenant_id
            ).run();
          } else if (!currentHosRecord) {
            // No current record, create a new one
            await env.DB.prepare(
              `INSERT INTO eld_hours_of_service (
                id, driver_id, vehicle_id, eld_device_id, status, start_time, tenant_id, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
            ).bind(
              uuidv4(),
              driverAssignment.driver_id,
              device.vehicle_id,
              device.id,
              telemetryData.hours_of_service_status,
              telemetryData.timestamp,
              device.tenant_id
            ).run();
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      message: 'Telemetry processed successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing ELD telemetry:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to process telemetry data',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get ELD devices for a tenant
 * @param request - The HTTP request
 * @param env - Environment variables
 * @returns Response with list of ELD devices or error
 */
export async function getEldDevices(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    if (!checkRole(tokenPayload, ['system_admin', 'client_admin', 'admin'])) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to view ELD devices',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check if tenant has access to ELD features
    const hasAccess = await checkFeatureAccess(env, tokenPayload.tenantId, 'eld_integration');
    if (!hasAccess && tokenPayload.role !== 'system_admin') {
      return new Response(JSON.stringify({
        error: 'SubscriptionRequired',
        message: 'ELD integration requires Premium or Enterprise subscription',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Fetch devices for the tenant (or all for system admin)
    let devices;
    if (tokenPayload.role === 'system_admin') {
      // System admin can see all devices
      devices = await env.DB.prepare(
        'SELECT * FROM eld_devices ORDER BY created_at DESC'
      ).all<EldDevice>();
    } else {
      // Others can only see their tenant's devices
      devices = await env.DB.prepare(
        'SELECT * FROM eld_devices WHERE tenant_id = ? ORDER BY created_at DESC'
      ).bind(tokenPayload.tenantId).all<EldDevice>();
    }
    
    return new Response(JSON.stringify(devices.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching ELD devices:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch ELD devices',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Get hours of service records for a driver
 * @param request - The HTTP request
 * @param env - Environment variables
 * @param driverId - The driver ID to fetch HOS records for
 * @returns Response with HOS records or error
 */
export async function getDriverHos(
  request: Request,
  env: Env,
  driverId: string
): Promise<Response> {
  try {
    // Verify JWT and check if user has appropriate role
    const tokenPayload = await requireAuth(request, env);
    
    // Check if tenant has access to ELD features
    const hasAccess = await checkFeatureAccess(env, tokenPayload.tenantId, 'eld_integration');
    if (!hasAccess && tokenPayload.role !== 'system_admin') {
      return new Response(JSON.stringify({
        error: 'SubscriptionRequired',
        message: 'ELD integration requires Premium or Enterprise subscription',
        status: 403
      }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check if the driver belongs to the same tenant as the user (unless system admin)
    if (tokenPayload.role !== 'system_admin') {
      const driverTenant = await env.DB.prepare(
        'SELECT tenant_id FROM users WHERE id = ?'
      ).bind(driverId).first<{ tenant_id: string }>();
      
      if (!driverTenant || driverTenant.tenant_id !== tokenPayload.tenantId) {
        return new Response(JSON.stringify({
          error: 'Forbidden',
          message: 'You can only access HOS records for drivers in your organization',
          status: 403
        }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    }
    
    // Get the time range from query parameters (default to last 7 days)
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || 
      new Date().toISOString().split('T')[0];
    
    // Fetch HOS records for the driver within the time range
    const hosRecords = await env.DB.prepare(
      `SELECT * FROM eld_hours_of_service 
       WHERE driver_id = ? 
       AND start_time >= ? 
       AND (end_time <= ? OR end_time IS NULL)
       ORDER BY start_time DESC`
    ).bind(driverId, startDate, endDate + ' 23:59:59').all<HoursOfService>();
    
    return new Response(JSON.stringify(hosRecords.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching HOS records:', error);
    return new Response(JSON.stringify({
      error: 'InternalServerError',
      message: 'Failed to fetch hours of service records',
      status: 500
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}