/**
 * GPS Tracking Service for TowTrace
 * 
 * Manages driver location tracking, status changes, and arrival notifications.
 */

import { User } from '@/app/context/auth-context';
import { isNearby, generateNearbyLocation } from '@/utils/locationUtils';

// Simulation constants
const RANDOM_ARRIVAL_THRESHOLD = 0.7; // 70% chance of simulating driver being at destination

/**
 * Handles the GPS status change based on driver duty status
 * 
 * @param {User} userData - The current user data
 * @param {string} newStatus - The new duty status
 * @returns {boolean} Whether GPS tracking is enabled after the change
 */
export const handleGPSStatusChange = (userData: User, newStatus: string): boolean => {
  const isGpsEnabled = newStatus !== 'Off Duty';
  
  if (!isGpsEnabled) {
    console.log('GPS tracking disabled due to Off Duty status');
    // In a real implementation, this would call native tracking APIs to stop
  } else if (newStatus === 'On Duty' && userData.activeLoads && userData.activeLoads > 0) {
    console.log('GPS tracking enabled due to On Duty status with active loads');
    // In a real implementation, this would call native tracking APIs to start
  }
  
  return isGpsEnabled;
};

/**
 * Check if user has arrived at pickup or dropoff location and show alerts
 * 
 * @param {User} userData - The user data containing location information
 * @returns {string|null} Message if location arrival detected, null otherwise
 */
export const checkLocationArrival = (userData: User): string | null => {
  if (!userData || userData.role !== 'driver' || !userData.gpsEnabled) {
    return null;
  }
  
  // Check for pickup location arrival
  if (userData.currentLocation && userData.currentPickupLocation) {
    // Check if within threshold distance of pickup location
    if (isNearby(
      userData.currentLocation.lat,
      userData.currentLocation.lng,
      userData.currentPickupLocation.lat,
      userData.currentPickupLocation.lng
    )) {
      return `You have arrived at the pickup location: ${userData.currentPickupLocation.locationName}. Please scan the VINs of all vehicles to verify pickup.`;
    }
  }
  
  // Check for dropoff location arrival
  if (userData.currentLocation && userData.currentDropoffLocation) {
    // Check if within threshold distance of dropoff location
    if (isNearby(
      userData.currentLocation.lat,
      userData.currentLocation.lng,
      userData.currentDropoffLocation.lat,
      userData.currentDropoffLocation.lng
    )) {
      return `You have arrived at the dropoff location: ${userData.currentDropoffLocation.locationName}. Please mark each vehicle as dropped to complete the delivery.`;
    }
  }
  
  return null;
};

/**
 * Simulate location updates for demo/testing purposes
 * In production, this would be replaced with real GPS data
 * 
 * @param {User} userData - The user data to simulate location updates for
 * @returns {User} Updated user data with simulated location
 */
export const simulateLocationUpdate = (userData: User): User => {
  const updatedUser = { ...userData };
  
  if (userData.role !== 'driver' || !userData.gpsEnabled) {
    return updatedUser;
  }
  
  // If the user is a driver, simulate movement based on current status
  if (Math.random() > RANDOM_ARRIVAL_THRESHOLD && userData.currentDropoffLocation) {
    // Simulate driver being near dropoff location
    updatedUser.currentLocation = {
      lat: userData.currentDropoffLocation.lat,
      lng: userData.currentDropoffLocation.lng,
      lastUpdated: new Date().toISOString()
    };
    
    // Add a small random offset to make it more realistic
    const nearbyLocation = generateNearbyLocation(
      updatedUser.currentLocation.lat,
      updatedUser.currentLocation.lng,
      0.0005 // 0.5 meter radius
    );
    
    updatedUser.currentLocation.lat = nearbyLocation.lat;
    updatedUser.currentLocation.lng = nearbyLocation.lng;
  }
  
  return updatedUser;
};