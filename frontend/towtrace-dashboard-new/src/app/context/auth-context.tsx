'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loginUser, 
  registerUser, 
  updateUser, 
  saveUserToStorage, 
  loadUserFromStorage,
  clearUserFromStorage 
} from '@/services/AuthService';
import { 
  handleGPSStatusChange, 
  checkLocationArrival,
  simulateLocationUpdate 
} from '@/services/GPSTrackingService';

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

/**
 * Custom hook to access the authentication context
 * 
 * Provides access to the current user, authentication state, and auth-related functions
 * throughout the application.
 * 
 * @returns {AuthContextType} Authentication context with user data and auth functions
 * 
 * @example
 * // In a component
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * // Check if user is logged in
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 */
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

/**
 * AuthProvider - Authentication context provider component
 * 
 * Provides authentication state and functions to all child components.
 * Handles user authentication, login, logout, profile updates, and simulates 
 * location-based alerts for drivers.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render within the provider
 * @returns {JSX.Element} The provider component with children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // These functions have been moved to separate utility files

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check localStorage for existing user data
        const storedUser = loadUserFromStorage();
        
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Auto-login for development with mock user
          setUser(MOCK_USER);
          saveUserToStorage(MOCK_USER);
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

  /**
   * Update user profile with changes and handle GPS tracking if status changes
   * 
   * @param {Partial<User>} updatedUser - The user properties to update
   */
  const updateUserProfile = async (updatedUser: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Get base updated user data
      let newUserData = await updateUser(user, updatedUser);
      
      // Handle GPS tracking changes if status is updated
      if (updatedUser.status !== undefined) {
        // Update GPS tracking status
        newUserData.gpsEnabled = handleGPSStatusChange(newUserData, updatedUser.status);
        
        // If GPS is enabled and user is a driver, simulate location updates
        if (newUserData.gpsEnabled && newUserData.role === 'driver') {
          newUserData = simulateLocationUpdate(newUserData);
          
          // Check for location arrival and show notification if needed
          const arrivalMessage = checkLocationArrival(newUserData);
          if (arrivalMessage) {
            alert(arrivalMessage);
          }
        }
      }
      
      // Update state and storage
      setUser(newUserData);
      saveUserToStorage(newUserData);
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user account
   * 
   * @param {Partial<User>} userData - New user data
   * @param {string} password - User password
   */
  const signup = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // Register the new user
      const newUser = await registerUser(userData, password);
      
      // Set the new user and save to storage
      setUser(newUser);
      saveUserToStorage(newUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Authenticate with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Create mock users object for the auth service
      const mockUsers = {
        driver: MOCK_DRIVER,
        admin: MOCK_USER
      };
      
      // Attempt login
      const loggedInUser = await loginUser(email, password, mockUsers);
      
      // Save authenticated user
      setUser(loggedInUser);
      saveUserToStorage(loggedInUser);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay for session invalidation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user from state and storage
      setUser(null);
      clearUserFromStorage();
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