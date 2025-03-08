/**
 * Location utility functions for TowTrace
 * 
 * This module contains geographic utility functions for distance calculations,
 * location tracking, and geofencing.
 */

// Distance constants
export const NEARBY_DISTANCE_KM = 0.1; // 100 meters
export const EARTH_RADIUS_KM = 6371; // Radius of the earth in km

/**
 * Convert degrees to radians
 * 
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
export const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance between points in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = EARTH_RADIUS_KM * c; // Distance in km
  return distance;
};

/**
 * Check if two locations are within a specified distance of each other
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {number} maxDistanceKm - Maximum distance in kilometers (default: NEARBY_DISTANCE_KM)
 * @returns {boolean} True if locations are within the specified distance
 */
export const isNearby = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  maxDistanceKm = NEARBY_DISTANCE_KM
): boolean => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= maxDistanceKm;
};

/**
 * Generate a slightly randomized location near a given point
 * Useful for simulating movement in demo/test scenarios
 * 
 * @param {number} baseLat - Base latitude
 * @param {number} baseLng - Base longitude
 * @param {number} radiusKm - Radius in kilometers to randomize within
 * @returns {{lat: number, lng: number}} New randomized location
 */
export const generateNearbyLocation = (
  baseLat: number,
  baseLng: number,
  radiusKm = 0.001 // Default 1 meter for small variations
): {lat: number, lng: number} => {
  return {
    lat: baseLat + (Math.random() * radiusKm * 2 - radiusKm),
    lng: baseLng + (Math.random() * radiusKm * 2 - radiusKm)
  };
};