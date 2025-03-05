import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

/**
 * Service for interacting with ELD-related API endpoints (driver version)
 */
export class EldService {
  // GPS tracking interval in milliseconds
  private static LOADED_TRACKING_INTERVAL = 10000; // 10 seconds when loaded
  private static UNLOADED_TRACKING_INTERVAL = 60000; // 60 seconds when unloaded
  private static trackingTimer: NodeJS.Timeout | null = null;
  private static isTracking = false;
  private static isLoaded = false;
  
  /**
   * Start GPS tracking with battery-friendly implementation
   * @param isLoaded - Whether the driver is currently loaded (has cargo)
   * @returns void
   */
  static startBatteryFriendlyTracking(isLoaded: boolean): void {
    // Stop any existing tracking
    this.stopTracking();
    
    // Set loaded status
    this.isLoaded = isLoaded;
    
    // Set tracking as active
    this.isTracking = true;
    
    // Determine appropriate interval based on load status
    const interval = isLoaded 
      ? this.LOADED_TRACKING_INTERVAL 
      : this.UNLOADED_TRACKING_INTERVAL;
    
    // Start tracking at the determined interval
    this.trackingTimer = setInterval(async () => {
      try {
        // Get current position
        const position = await new Promise<any>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (error) => reject(error),
            { 
              enableHighAccuracy: isLoaded, // High accuracy only when loaded to save battery
              timeout: 15000, 
              maximumAge: isLoaded ? 5000 : 30000 // Allow older positions when unloaded
            }
          );
        });
        
        // Get authentication token
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('Not authenticated');
        
        // Prepare location update
        const locationData = {
          device_serial: await AsyncStorage.getItem('eldDeviceSerial') || 'MOBILE_APP',
          timestamp: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy,
          is_loaded: isLoaded
        };
        
        // Send location update to API
        await axios.post(
          `${API_BASE_URL}/api/tracking/location`,
          locationData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error updating GPS location:', error);
        
        // Store offline if network error
        const isConnected = await NetInfo.fetch().then(state => state.isConnected);
        if (!isConnected) {
          // Queue the location update for when connection is restored
          // Implementation would be similar to HOS offline queue
        }
      }
    }, interval);
  }
  
  /**
   * Stop GPS tracking
   * @returns void
   */
  static stopTracking(): void {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }
    this.isTracking = false;
  }
  
  /**
   * Update load status and adjust tracking interval accordingly
   * @param isLoaded - Whether the driver is currently loaded
   * @returns void
   */
  static updateLoadStatus(isLoaded: boolean): void {
    // Only restart tracking if load status has changed
    if (this.isLoaded !== isLoaded && this.isTracking) {
      this.startBatteryFriendlyTracking(isLoaded);
    }
    this.isLoaded = isLoaded;
  }
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