import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

/**
 * Service for interacting with ELD-related API endpoints (driver version)
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
   * Get the current driver's HOS summary
   * @returns Promise resolving to HOS summary data
   */
  static async getCurrentDriverHosSummary(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Get driver ID from token using a safer method for React Native
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Array.from(atob(base64))
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const tokenPayload = JSON.parse(jsonPayload);
      const driverId = tokenPayload.userId;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/eld/drivers/${driverId}/hos/summary`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching HOS summary:', error);
      return null;
    }
  }
  
  /**
   * Update the driver's HOS status
   * @param status - New HOS status ('on_duty', 'off_duty', 'driving', 'sleeping')
   * @returns Promise resolving to the updated HOS record
   */
  static async updateHosStatus(status: 'on_duty' | 'off_duty' | 'driving' | 'sleeping'): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Get driver ID from token using a safer method for React Native
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Array.from(atob(base64))
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const tokenPayload = JSON.parse(jsonPayload);
      const driverId = tokenPayload.userId;
      
      // Get current position
      const position = await new Promise<any>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
      
      // Prepare telemetry data
      const telemetryData = {
        device_serial: await AsyncStorage.getItem('eldDeviceSerial') || 'MOBILE_APP',
        timestamp: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed || 0,
        engine_status: 'on',
        hours_of_service_status: status,
      };
      
      // Send telemetry update (which will create a new HOS record)
      const response = await axios.post(
        `${API_BASE_URL}/api/eld/telemetry`,
        telemetryData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating HOS status:', error);
      
      // Store offline if network error
      const isConnected = await NetInfo.fetch().then(state => state.isConnected);
      if (!isConnected) {
        // Queue the status change for when connection is restored
        const offlineHosUpdates = await AsyncStorage.getItem('offlineHosUpdates');
        const updates = offlineHosUpdates ? JSON.parse(offlineHosUpdates) : [];
        
        updates.push({
          status,
          timestamp: new Date().toISOString()
        });
        
        await AsyncStorage.setItem('offlineHosUpdates', JSON.stringify(updates));
        return { queued: true, status };
      }
      
      throw error;
    }
  }
  
  /**
   * Sync any offline HOS updates when connection is restored
   * @returns Promise resolving to true if sync was successful
   */
  static async syncOfflineHosUpdates(): Promise<boolean> {
    try {
      const offlineHosUpdates = await AsyncStorage.getItem('offlineHosUpdates');
      if (!offlineHosUpdates) return true;
      
      const updates = JSON.parse(offlineHosUpdates);
      if (updates.length === 0) return true;
      
      // Process each offline update in order
      for (const update of updates) {
        await this.updateHosStatus(update.status);
      }
      
      // Clear offline queue
      await AsyncStorage.removeItem('offlineHosUpdates');
      return true;
    } catch (error) {
      console.error('Error syncing offline HOS updates:', error);
      return false;
    }
  }
  
  /**
   * Get HOS logs for the current driver
   * @param startDate - Optional start date (ISO string)
   * @param endDate - Optional end date (ISO string)
   * @returns Promise resolving to HOS logs
   */
  static async getDriverHosLogs(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return [];
      
      // Get driver ID from token using a safer method for React Native
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Array.from(atob(base64))
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const tokenPayload = JSON.parse(jsonPayload);
      const driverId = tokenPayload.userId;
      
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
      console.error('Error fetching driver HOS logs:', error);
      return [];
    }
  }
}