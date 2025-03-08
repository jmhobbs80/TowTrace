import { EldService } from './EldService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';

// Mock dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock setInterval and clearInterval
jest.useFakeTimers();
global.setInterval = jest.fn() as unknown as typeof setInterval;
global.clearInterval = jest.fn() as unknown as typeof clearInterval;

// Sample API responses
const mockHosSummaryResponse = {
  driver_id: 'driver123',
  driver_name: 'John Doe',
  total_driving_minutes: 240,
  total_on_duty_minutes: 480,
  total_off_duty_minutes: 720,
  total_sleeping_minutes: 0,
  remaining_drive_time_minutes: 360,
  remaining_duty_time_minutes: 240,
  on_break: false,
  violations: [],
  current_status: 'on_duty',
  current_status_start_time: '2025-03-08T08:00:00Z',
};

const mockHosLogsResponse = [
  {
    id: 'hos1',
    driver_id: 'driver123',
    status: 'on_duty',
    start_time: '2025-03-08T08:00:00Z',
    end_time: '2025-03-08T12:00:00Z',
    duration_minutes: 240,
  },
  {
    id: 'hos2',
    driver_id: 'driver123',
    status: 'off_duty',
    start_time: '2025-03-08T12:00:00Z',
    end_time: null,
    duration_minutes: null,
  },
];

const mockTelemetryResponse = {
  success: true,
  hours_of_service_record: {
    id: 'hos3',
    driver_id: 'driver123',
    status: 'driving',
    start_time: '2025-03-08T14:00:00Z',
  },
};

// Sample token with embedded user ID
const mockToken = 'header.eyJ1c2VySWQiOiJkcml2ZXIxMjMiLCJyb2xlIjoiZHJpdmVyIn0.signature';

describe('EldService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'authToken') return Promise.resolve(mockToken);
      if (key === 'eldDeviceSerial') return Promise.resolve('DEVICE123');
      if (key === 'offlineHosUpdates') return Promise.resolve(null);
      return Promise.resolve(null);
    });
    
    // Reset NetInfo mock
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    
    // Mock global atob function for token parsing
    global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('binary'));
  });
  
  describe('GPS Tracking', () => {
    it('should start battery-friendly tracking with correct interval when loaded', () => {
      EldService.startBatteryFriendlyTracking(true);
      
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 10000);
      
      // Verify tracking is active
      expect((EldService as any).isTracking).toBe(true);
      expect((EldService as any).isLoaded).toBe(true);
    });
    
    it('should start battery-friendly tracking with longer interval when unloaded', () => {
      EldService.startBatteryFriendlyTracking(false);
      
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      
      // Verify tracking is active
      expect((EldService as any).isTracking).toBe(true);
      expect((EldService as any).isLoaded).toBe(false);
    });
    
    it('should stop tracking when requested', () => {
      // Setup: Start tracking first
      (EldService as any).trackingTimer = 123;
      (EldService as any).isTracking = true;
      
      EldService.stopTracking();
      
      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledWith(123);
      expect((EldService as any).trackingTimer).toBeNull();
      expect((EldService as any).isTracking).toBe(false);
    });
    
    it('should update tracking interval when load status changes', () => {
      // Setup: Start tracking as unloaded
      EldService.startBatteryFriendlyTracking(false);
      jest.clearAllMocks(); // Clear mocks to start fresh
      
      // Update to loaded
      EldService.updateLoadStatus(true);
      
      // Should restart tracking with new interval
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledTimes(1);
      expect((EldService as any).isLoaded).toBe(true);
    });
    
    it('should not restart tracking if load status is unchanged', () => {
      // Setup: Start tracking as loaded
      EldService.startBatteryFriendlyTracking(true);
      jest.clearAllMocks(); // Clear mocks to start fresh
      
      // Update with same status
      EldService.updateLoadStatus(true);
      
      // Shouldn't restart tracking
      expect(setInterval).not.toHaveBeenCalled();
      expect(clearInterval).not.toHaveBeenCalled();
    });
  });
  
  describe('ELD Access Check', () => {
    it('should return true when tenant has ELD access', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { hasAccess: true } });
      
      const result = await EldService.hasEldAccess();
      
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/api/eld/access',
        { headers: { Authorization: 'Bearer header.eyJ1c2VySWQiOiJkcml2ZXIxMjMiLCJyb2xlIjoiZHJpdmVyIn0.signature' } }
      );
    });
    
    it('should return false when tenant does not have ELD access', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { hasAccess: false } });
      
      const result = await EldService.hasEldAccess();
      
      expect(result).toBe(false);
    });
    
    it('should return false when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await EldService.hasEldAccess();
      
      expect(result).toBe(false);
    });
    
    it('should return false when not authenticated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await EldService.hasEldAccess();
      
      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
  
  describe('HOS Summary', () => {
    it('should fetch HOS summary for current driver', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockHosSummaryResponse });
      
      const result = await EldService.getCurrentDriverHosSummary();
      
      expect(result).toEqual(mockHosSummaryResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/api/eld/drivers/driver123/hos/summary',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
    
    it('should return null when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await EldService.getCurrentDriverHosSummary();
      
      expect(result).toBeNull();
    });
    
    it('should throw error when not authenticated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      await expect(EldService.getCurrentDriverHosSummary()).rejects.toThrow('Not authenticated');
    });
  });
  
  describe('HOS Status Updates', () => {
    it('should update HOS status and send telemetry data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockTelemetryResponse });
      
      const result = await EldService.updateHosStatus('driving');
      
      expect(result).toEqual(mockTelemetryResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/api/eld/telemetry',
        expect.objectContaining({
          device_serial: 'DEVICE123',
          hours_of_service_status: 'driving',
        }),
        expect.any(Object)
      );
    });
    
    it('should queue updates when offline', async () => {
      // Mock network disconnected
      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      const result = await EldService.updateHosStatus('off_duty');
      
      expect(result).toEqual({ queued: true, status: 'off_duty' });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offlineHosUpdates',
        expect.any(String)
      );
    });
  });
  
  describe('Offline Sync', () => {
    it('should process queued HOS updates when connection is restored', async () => {
      // Mock queued updates
      const queuedUpdates = [
        { status: 'off_duty', timestamp: '2025-03-08T15:00:00Z' },
        { status: 'driving', timestamp: '2025-03-08T16:00:00Z' }
      ];
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'offlineHosUpdates') return Promise.resolve(JSON.stringify(queuedUpdates));
        if (key === 'authToken') return Promise.resolve(mockToken);
        return Promise.resolve(null);
      });
      
      // Mock successful update
      mockedAxios.post.mockResolvedValue({ data: mockTelemetryResponse });
      
      const result = await EldService.syncOfflineHosUpdates();
      
      expect(result).toBe(true);
      // Should have called update for each queued item
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      // Should have cleared the queue
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('offlineHosUpdates');
    });
    
    it('should handle empty queue gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      
      const result = await EldService.syncOfflineHosUpdates();
      
      expect(result).toBe(true);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
  
  describe('HOS Logs', () => {
    it('should fetch HOS logs for current driver', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockHosLogsResponse });
      
      const result = await EldService.getDriverHosLogs();
      
      expect(result).toEqual(mockHosLogsResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/api/eld/drivers/driver123/hos',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
    
    it('should include date filters when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockHosLogsResponse });
      
      await EldService.getDriverHosLogs('2025-03-08T00:00:00Z', '2025-03-08T23:59:59Z');
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2025-03-08T00:00:00Z'),
        expect.any(Object)
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2025-03-08T23:59:59Z'),
        expect.any(Object)
      );
    });
    
    it('should return empty array when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await EldService.getDriverHosLogs();
      
      expect(result).toEqual([]);
    });
  });
});