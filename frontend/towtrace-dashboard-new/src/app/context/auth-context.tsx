'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Expanded User type to include profile information
export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'manager' | 'system_admin' | 'client_admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: 'On Duty' | 'Off Duty' | 'On Break';
  gpsEnabled?: boolean;
  activeLoads?: number;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
  currentPickupLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    expectedArrival: string;
    vehicleCount: number;
  };
  currentDropoffLocation?: {
    lat: number;
    lng: number;
    locationName: string;
    expectedArrival: string;
    vehicleCount: number;
  };
  avatar?: string;
  lastLogin?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  timeZone?: string;
  bio?: string;
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    weeklyReports: boolean;
    theme: string;
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  updateUserProfile: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock user data for development
const MOCK_USER: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@towtrace.com',
  role: 'admin',
  status: 'On Duty',
  avatar: 'https://i.pravatar.cc/150?u=admin@towtrace.com',
  lastLogin: new Date().toISOString(),
  phoneNumber: '(555) 123-4567',
  company: 'TowTrace Transport',
  jobTitle: 'System Administrator',
  timeZone: 'America/New_York',
  bio: 'Experienced system administrator with expertise in fleet management and transportation logistics.',
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    theme: 'light',
  },
};

// Mock driver user for testing
const MOCK_DRIVER: User = {
  id: '2',
  name: 'Driver User',
  email: 'driver@towtrace.com',
  role: 'driver',
  status: 'On Duty',
  gpsEnabled: true,
  activeLoads: 2,
  currentLocation: {
    lat: 33.4484,
    lng: -112.0740,
    lastUpdated: new Date().toISOString()
  },
  currentPickupLocation: {
    lat: 33.4491,
    lng: -112.0738,
    locationName: '245 E Washington St, Phoenix, AZ',
    expectedArrival: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    vehicleCount: 3
  },
  currentDropoffLocation: {
    lat: 33.4200,
    lng: -112.0695,
    locationName: '2100 S 7th St, Phoenix, AZ',
    expectedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    vehicleCount: 3
  },
  avatar: 'https://i.pravatar.cc/150?u=driver@towtrace.com',
  lastLogin: new Date().toISOString(),
  phoneNumber: '(555) 987-6543',
  company: 'TowTrace Transport',
  jobTitle: 'Truck Driver',
  timeZone: 'America/Chicago',
  bio: 'Experienced truck driver with 10+ years in the transportation industry.',
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: true,
    weeklyReports: false,
    theme: 'light',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to check if user is at pickup or dropoff location and show alert
  const checkLocationArrival = (userData: User) => {
    if (!userData || userData.role !== 'driver' || !userData.gpsEnabled) return;
    
    // Check for pickup location arrival
    if (userData.currentLocation && userData.currentPickupLocation) {
      // Calculate distance between current location and pickup location
      const distanceToPickup = calculateDistance(
        userData.currentLocation.lat,
        userData.currentLocation.lng,
        userData.currentPickupLocation.lat,
        userData.currentPickupLocation.lng
      );
      
      // If within 100 meters of pickup location, show alert to scan VINs
      if (distanceToPickup < 0.1) { // 0.1 km = 100 meters
        alert(`You have arrived at the pickup location: ${userData.currentPickupLocation.locationName}. Please scan the VINs of all vehicles to verify pickup.`);
        return; // Early return to not show both alerts at once
      }
    }
    
    // Check for dropoff location arrival
    if (userData.currentLocation && userData.currentDropoffLocation) {
      // Calculate distance between current location and dropoff location
      const distanceToDropoff = calculateDistance(
        userData.currentLocation.lat,
        userData.currentLocation.lng,
        userData.currentDropoffLocation.lat,
        userData.currentDropoffLocation.lng
      );
      
      // If within 100 meters of dropoff location, show alert
      if (distanceToDropoff < 0.1) { // 0.1 km = 100 meters
        // Alert the driver to mark vehicles as dropped
        alert(`You have arrived at the dropoff location: ${userData.currentDropoffLocation.locationName}. Please mark each vehicle as dropped to complete the delivery.`);
      }
    }
  };
  
  // Function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Convert degrees to radians
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check localStorage for existing user data
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Auto-login for development with mock user
          setUser(MOCK_USER);
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Update user profile
  const updateUserProfile = async (updatedUser: Partial<User>) => {
    setIsLoading(true);
    try {
      // In production, this would make an API call to update the user profile
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const newUserData = { ...user, ...updatedUser };
        
        // Special handling for GPS tracking status changes
        if (updatedUser.status !== undefined) {
          // Update GPS enabled status based on duty status
          newUserData.gpsEnabled = updatedUser.status !== 'Off Duty';
          
          // If status is changed to Off Duty, we need to simulate disabling GPS tracking
          if (updatedUser.status === 'Off Duty') {
            console.log('GPS tracking disabled due to Off Duty status');
            // In a real implementation, this would call the tracking service to stop
          } 
          // If status is changed to On Duty and they have active loads, we need to simulate enabling GPS tracking
          else if (updatedUser.status === 'On Duty' && newUserData.activeLoads && newUserData.activeLoads > 0) {
            console.log('GPS tracking enabled due to On Duty status with active loads');
            // In a real implementation, this would call the tracking service to start
            
            // Simulate location updates for demonstration purposes
            if (newUserData.role === 'driver') {
              // Set a random check for whether driver is near dropoff location (for demo purposes)
              if (Math.random() > 0.7 && newUserData.currentDropoffLocation) {
                // Simulate driver being near dropoff location
                newUserData.currentLocation = {
                  lat: newUserData.currentDropoffLocation.lat + (Math.random() * 0.001 - 0.0005),
                  lng: newUserData.currentDropoffLocation.lng + (Math.random() * 0.001 - 0.0005),
                  lastUpdated: new Date().toISOString()
                };
                
                // Check if driver has arrived at pickup or dropoff location
                checkLocationArrival(newUserData);
              }
            }
          }
        }
        
        // Update the user in state
        setUser(newUserData);
        
        // Update localStorage to persist changes
        localStorage.setItem('user', JSON.stringify(newUserData));
        
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // In production, this would make an API call to create a new user
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new user with default values for missing fields
      const newUser: User = {
        id: Math.floor(Math.random() * 10000).toString(), // Generate random ID
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'driver',
        avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
        lastLogin: new Date().toISOString(),
        phoneNumber: userData.phoneNumber || '',
        company: userData.company || 'TowTrace Transport',
        jobTitle: userData.jobTitle || '',
        timeZone: userData.timeZone || 'America/New_York',
        bio: userData.bio || '',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          weeklyReports: true,
          theme: 'light',
        },
      };
      
      // Set the new user and save to localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In production, this would make an API call to verify credentials
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Match user based on email
      let loggedInUser;
      
      if (email.includes('driver')) {
        loggedInUser = { 
          ...MOCK_DRIVER, 
          lastLogin: new Date().toISOString(),
          email: email // Use the email from login attempt
        };
      } else {
        loggedInUser = { 
          ...MOCK_USER, 
          lastLogin: new Date().toISOString(),
          email: email // Use the email from login attempt
        };
      }
      
      // Save to state and localStorage
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // In production, this would make an API call to invalidate the session
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('user');
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}