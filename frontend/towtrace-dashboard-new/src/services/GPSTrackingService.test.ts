/**
 * Unit tests for GPS Tracking Service
 */

import { User } from '@/app/context/auth-context';
import { 
  handleGPSStatusChange, 
  checkLocationArrival, 
  simulateLocationUpdate 
} from './GPSTrackingService';
import * as locationUtils from '@/utils/locationUtils';

// Mock the location utilities to control their behavior
jest.mock('@/utils/locationUtils', () => ({
  isNearby: jest.fn(),
  generateNearbyLocation: jest.fn()
}));

// Spy on console.log for testing logging
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});
afterEach(() => {
  console.log = originalConsoleLog;
});

describe('GPSTrackingService', () => {
  // Base driver user for tests
  const mockDriver: User = {
    id: '123',
    name: 'Test Driver',
    email: 'driver@test.com',
    role: 'driver',
    gpsEnabled: true,
    activeLoads: 2,
    currentLocation: {
      lat: 40.7128,
      lng: -74.0060,
      lastUpdated: new Date().toISOString()
    },
    currentPickupLocation: {
      lat: 40.7129,
      lng: -74.0061,
      locationName: 'Pickup Location',
      expectedArrival: new Date().toISOString(),
      vehicleCount: 1
    },
    currentDropoffLocation: {
      lat: 40.7130,
      lng: -74.0062,
      locationName: 'Dropoff Location',
      expectedArrival: new Date().toISOString(),
      vehicleCount: 1
    }
  };
  
  describe('handleGPSStatusChange', () => {
    it('should enable GPS when status is On Duty', () => {
      const result = handleGPSStatusChange(mockDriver, 'On Duty');
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('GPS tracking enabled')
      );
    });
    
    it('should disable GPS when status is Off Duty', () => {
      const result = handleGPSStatusChange(mockDriver, 'Off Duty');
      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('GPS tracking disabled')
      );
    });
    
    it('should handle non-driver users', () => {
      const adminUser = { ...mockDriver, role: 'admin' as any, activeLoads: 0 };
      const result = handleGPSStatusChange(adminUser, 'On Duty');
      expect(result).toBe(true);
      // No GPS message for non-drivers with active loads
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('GPS tracking enabled due to On Duty status with active loads')
      );
    });
    
    it('should handle drivers without active loads', () => {
      const driverWithoutLoads = { ...mockDriver, activeLoads: 0 };
      const result = handleGPSStatusChange(driverWithoutLoads, 'On Duty');
      expect(result).toBe(true);
      // No GPS message for drivers without active loads
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('GPS tracking enabled due to On Duty status with active loads')
      );
    });
  });
  
  describe('checkLocationArrival', () => {
    it('should return null for non-driver users', () => {
      const adminUser = { ...mockDriver, role: 'admin' as any };
      const result = checkLocationArrival(adminUser);
      expect(result).toBeNull();
    });
    
    it('should return null when GPS is disabled', () => {
      const driverWithGpsDisabled = { ...mockDriver, gpsEnabled: false };
      const result = checkLocationArrival(driverWithGpsDisabled);
      expect(result).toBeNull();
    });
    
    it('should check pickup location arrival', () => {
      // Setup mock to indicate the driver is at the pickup location
      (locationUtils.isNearby as jest.Mock).mockReturnValueOnce(true);
      
      const result = checkLocationArrival(mockDriver);
      
      expect(locationUtils.isNearby).toHaveBeenCalledWith(
        mockDriver.currentLocation!.lat,
        mockDriver.currentLocation!.lng,
        mockDriver.currentPickupLocation!.lat,
        mockDriver.currentPickupLocation!.lng
      );
      
      expect(result).toContain('You have arrived at the pickup location');
      expect(result).toContain(mockDriver.currentPickupLocation!.locationName);
    });
    
    it('should check dropoff location arrival if not at pickup', () => {
      // Clear previous mock calls
      jest.clearAllMocks();
      
      // Setup mock to indicate the driver is not at pickup but at dropoff
      (locationUtils.isNearby as jest.Mock)
        .mockReturnValueOnce(false) // Not at pickup
        .mockReturnValueOnce(true); // At dropoff
      
      const result = checkLocationArrival(mockDriver);
      
      // Should check pickup first, then dropoff
      expect(locationUtils.isNearby).toHaveBeenCalledTimes(2);
      
      expect(result).toContain('You have arrived at the dropoff location');
      expect(result).toContain(mockDriver.currentDropoffLocation!.locationName);
    });
    
    it('should return null if not at pickup or dropoff', () => {
      // Setup mock to indicate the driver is not at pickup or dropoff
      (locationUtils.isNearby as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      
      const result = checkLocationArrival(mockDriver);
      
      expect(result).toBeNull();
    });
  });
  
  describe('simulateLocationUpdate', () => {
    it('should return the same user data for non-drivers', () => {
      const adminUser = { ...mockDriver, role: 'admin' as any };
      const result = simulateLocationUpdate(adminUser);
      expect(result).toEqual(adminUser);
    });
    
    it('should return the same user data when GPS is disabled', () => {
      const driverWithGpsDisabled = { ...mockDriver, gpsEnabled: false };
      const result = simulateLocationUpdate(driverWithGpsDisabled);
      expect(result).toEqual(driverWithGpsDisabled);
    });
    
    it('should simulate new location for drivers near dropoff', () => {
      // Mock Math.random to ensure we trigger the dropoff location update
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.8); // Above threshold
      
      // Mock generateNearbyLocation to return a specific location
      const mockNearbyLocation = { lat: 40.9, lng: -74.2 };
      (locationUtils.generateNearbyLocation as jest.Mock).mockReturnValue(mockNearbyLocation);
      
      const result = simulateLocationUpdate(mockDriver);
      
      // Restore the original Math.random
      Math.random = originalRandom;
      
      expect(result.currentLocation!.lat).toBe(mockNearbyLocation.lat);
      expect(result.currentLocation!.lng).toBe(mockNearbyLocation.lng);
      
      // Check that the timestamp was updated
      expect(result.currentLocation!.lastUpdated).not.toBe(mockDriver.currentLocation!.lastUpdated);
    });
    
    it('should not simulate new location when random value is below threshold', () => {
      // Mock Math.random to ensure we don't trigger the dropoff location update
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Below threshold
      
      const result = simulateLocationUpdate(mockDriver);
      
      // Restore the original Math.random
      Math.random = originalRandom;
      
      // The location should not have been updated
      expect(result.currentLocation).toEqual(mockDriver.currentLocation);
    });
  });
});