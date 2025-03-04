import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

/**
 * Service for interacting with ELD-related API endpoints
 */
export class EldService {
  /**
   * Check if the current tenant has ELD access
   * @returns Promise resolving to boolean indicating access
   */
  static async hasEldAccess(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/eld/access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data.hasAccess === true;
    } catch (error) {
      console.error('Error checking ELD access:', error);
      return false;
    }
  }
  
  /**
   * Get all ELD devices for the current tenant
   * @returns Promise resolving to array of ELD devices
   */
  static async getDevices(): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return [];
      
      const response = await axios.get(
        `${API_BASE_URL}/api/eld/devices`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching ELD devices:', error);
      return [];
    }
  }
  
  /**
   * Register a new ELD device
   * @param deviceSerial - Serial number of the device
   * @param vehicleId - Optional ID of vehicle to associate with device
   * @returns Promise resolving to created device
   */
  static async registerDevice(deviceSerial: string, vehicleId?: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Get tenant ID from token
      // Use a safer method for parsing JWT in React Native
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Array.from(atob(base64))
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const tokenPayload = JSON.parse(jsonPayload);
      const tenantId = tokenPayload.tenantId;
      
      const response = await axios.post(
        `${API_BASE_URL}/api/eld/devices`,
        {
          device_serial: deviceSerial,
          vehicle_id: vehicleId,
          tenant_id: tenantId,
          status: 'inactive'
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error registering ELD device:', error);
      throw error;
    }
  }
  
  /**
   * Get hours of service data for a driver
   * @param driverId - ID of the driver to get HOS data for
   * @param startDate - Optional start date for filtering (ISO string)
   * @param endDate - Optional end date for filtering (ISO string)
   * @returns Promise resolving to HOS records
   */
  static async getDriverHos(driverId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return [];
      
      let url = `${API_BASE_URL}/api/eld/drivers/${driverId}/hos`;
      
      // Add date filters if provided
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(
        url,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching driver HOS records:', error);
      return [];
    }
  }
  
  /**
   * Get driver HOS summary
   * @param driverId - ID of the driver
   * @returns Promise resolving to HOS summary
   */
  static async getDriverHosSummary(driverId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/eld/drivers/${driverId}/hos/summary`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching driver HOS summary:', error);
      return null;
    }
  }
  
  /**
   * Associate an ELD device with a vehicle
   * @param deviceId - ID of the ELD device
   * @param vehicleId - ID of the vehicle
   * @returns Promise resolving to updated device
   */
  static async associateDeviceWithVehicle(deviceId: string, vehicleId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/eld/devices/${deviceId}`,
        {
          vehicle_id: vehicleId,
          status: 'active'
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error associating device with vehicle:', error);
      throw error;
    }
  }
  
  /**
   * Update the status of an ELD device
   * @param deviceId - ID of the ELD device
   * @param status - New status for the device ('active', 'inactive', 'maintenance')
   * @returns Promise resolving to updated device
   */
  static async updateDeviceStatus(deviceId: string, status: 'active' | 'inactive' | 'maintenance'): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/eld/devices/${deviceId}`,
        {
          status: status
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }
  
  /**
   * Get ELD analytics (Enterprise feature)
   * @returns Promise resolving to ELD analytics data
   */
  static async getEldAnalytics(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/eld/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching ELD analytics:', error);
      return null;
    }
  }
}