# TowTrace Code Refactoring

## Overview

This document describes the refactoring changes made to improve code quality in the TowTrace application. The main goals were:

1. Ensure all functions are under 50 lines
2. Add JSDoc documentation to all functions
3. Extract utilities into separate files
4. Improve file naming to match exports
5. Replace magic numbers with named constants
6. Follow single responsibility principle

## Changes Made

### 1. Location Utilities

Created a new utilities file for geographic calculations:

- **File**: `/src/utils/locationUtils.ts`
- **Functions**:
  - `calculateDistance`: Haversine formula for distance between coordinates
  - `deg2rad`: Convert degrees to radians
  - `isNearby`: Check if two points are within a certain distance
  - `generateNearbyLocation`: Create random location near a point
- **Constants**:
  - `NEARBY_DISTANCE_KM`: Standard distance for "nearby" checks (100m)
  - `EARTH_RADIUS_KM`: Earth's radius for calculations

### 2. GPS Tracking Service

Extracted GPS tracking logic to a separate service:

- **File**: `/src/services/GPSTrackingService.ts`
- **Functions**:
  - `handleGPSStatusChange`: Toggle GPS based on duty status
  - `checkLocationArrival`: Check if driver has arrived at a location
  - `simulateLocationUpdate`: Generate simulated location updates

### 3. Authentication Service

Moved authentication logic to a dedicated service:

- **File**: `/src/services/AuthService.ts`
- **Functions**:
  - `loginUser`: Handle user authentication
  - `registerUser`: Register new users
  - `updateUser`: Update user profile data
  - `saveUserToStorage`: Persist user data to localStorage
  - `loadUserFromStorage`: Load persisted user data
  - `clearUserFromStorage`: Remove user data on logout

### 4. Auth Context Refactoring

Simplified the `auth-context.tsx` by:

- Reducing function sizes to under 50 lines
- Extracting utility functions
- Adopting more declarative code style
- Improving error handling
- Using service functions instead of inline logic

### 5. Magic Numbers Replacement

Replaced magic numbers with named constants:

- Time-related constants (ONE_HOUR_MS, SEVEN_DAYS_MS, etc.)
- Distance constants (NEARBY_DISTANCE_KM)
- API simulation delays (AUTH_DELAY_MS, SIGNUP_DELAY_MS)

## Benefits

1. **Improved Readability**: Functions are now shorter and focused on a single task
2. **Better Maintainability**: Related logic is grouped in dedicated service files
3. **Self-Documentation**: Functions have clear JSDoc comments explaining their purpose
4. **Testability**: Functions can be tested in isolation
5. **Code Reuse**: Utility functions can be used across different components

## Next Steps

1. Add unit tests for utility functions
2. Apply similar refactoring to other components
3. Create integration tests for services
4. Update documentation with the new architecture