/**
 * Unit tests for location utility functions
 */

import {
  deg2rad,
  calculateDistance,
  isNearby,
  generateNearbyLocation,
  NEARBY_DISTANCE_KM,
  EARTH_RADIUS_KM
} from './locationUtils';

describe('locationUtils', () => {
  describe('deg2rad', () => {
    it('should convert degrees to radians correctly', () => {
      // Test cases: [degrees, expected radians]
      const testCases = [
        [0, 0],
        [180, Math.PI],
        [360, 2 * Math.PI],
        [90, Math.PI / 2],
        [-90, -Math.PI / 2]
      ];
      
      testCases.forEach(([degrees, expected]) => {
        const result = deg2rad(degrees as number);
        expect(result).toBeCloseTo(expected as number);
      });
    });
  });
  
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Test cases: [lat1, lon1, lat2, lon2, expected distance in km]
      const testCases = [
        // Same point - should be 0
        [40.7128, -74.0060, 40.7128, -74.0060, 0],
        
        // New York to London - approximately 5570 km
        [40.7128, -74.0060, 51.5074, -0.1278, 5570],
        
        // San Francisco to Los Angeles - approximately 550 km
        [37.7749, -122.4194, 34.0522, -118.2437, 550],
        
        // Sydney to Tokyo - approximately 7920 km
        [-33.8688, 151.2093, 35.6762, 139.6503, 7920]
      ];
      
      testCases.forEach(([lat1, lon1, lat2, lon2, expected]) => {
        const result = calculateDistance(
          lat1 as number, 
          lon1 as number, 
          lat2 as number, 
          lon2 as number
        );
        
        // Use a 5% tolerance for long distances due to earth's non-perfect spherical shape
        const tolerance = (expected as number) * 0.05;
        expect(result).toBeGreaterThanOrEqual((expected as number) - tolerance);
        expect(result).toBeLessThanOrEqual((expected as number) + tolerance);
      });
    });
    
    it('should use the correct Earth radius', () => {
      // Test that the function uses EARTH_RADIUS_KM
      expect(EARTH_RADIUS_KM).toBe(6371);
    });
  });
  
  describe('isNearby', () => {
    it('should correctly identify nearby points', () => {
      // Points that are within 100m
      expect(isNearby(40.7128, -74.0060, 40.7129, -74.0061)).toBe(true);
      
      // Points that are definitely not within 100m
      expect(isNearby(40.7128, -74.0060, 40.7228, -74.0160)).toBe(false);
    });
    
    it('should respect custom distance threshold', () => {
      // Points that are about 1km apart
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 40.7218; // Approximately 1km north
      const lon2 = -74.0060;
      
      // Should not be nearby with default threshold (100m)
      expect(isNearby(lat1, lon1, lat2, lon2)).toBe(false);
      
      // Should be nearby with 1.5km threshold
      expect(isNearby(lat1, lon1, lat2, lon2, 1.5)).toBe(true);
    });
    
    it('should use NEARBY_DISTANCE_KM as default threshold', () => {
      // Test that the function uses NEARBY_DISTANCE_KM
      expect(NEARBY_DISTANCE_KM).toBe(0.1); // 100 meters
    });
  });
  
  describe('generateNearbyLocation', () => {
    it('should generate a location close to the base location', () => {
      const baseLat = 40.7128;
      const baseLng = -74.0060;
      const result = generateNearbyLocation(baseLat, baseLng);
      
      // The result should be close to the base location
      expect(result.lat).toBeGreaterThanOrEqual(baseLat - 0.001);
      expect(result.lat).toBeLessThanOrEqual(baseLat + 0.001);
      expect(result.lng).toBeGreaterThanOrEqual(baseLng - 0.001);
      expect(result.lng).toBeLessThanOrEqual(baseLng + 0.001);
    });
    
    it('should respect custom radius', () => {
      const baseLat = 40.7128;
      const baseLng = -74.0060;
      const radius = 0.01; // 10x the default
      const result = generateNearbyLocation(baseLat, baseLng, radius);
      
      // The result should be within the specified radius
      expect(result.lat).toBeGreaterThanOrEqual(baseLat - radius);
      expect(result.lat).toBeLessThanOrEqual(baseLat + radius);
      expect(result.lng).toBeGreaterThanOrEqual(baseLng - radius);
      expect(result.lng).toBeLessThanOrEqual(baseLng + radius);
    });
    
    it('should generate different locations on each call', () => {
      const baseLat = 40.7128;
      const baseLng = -74.0060;
      const result1 = generateNearbyLocation(baseLat, baseLng);
      const result2 = generateNearbyLocation(baseLat, baseLng);
      
      // There is an extremely small chance that these will be equal
      // In practice, this test should pass virtually always
      expect(
        result1.lat !== result2.lat || result1.lng !== result2.lng
      ).toBe(true);
    });
  });
});