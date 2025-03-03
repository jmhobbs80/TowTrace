/**
 * Authentication utility functions
 * Handles user authentication, session management, and role-based access control
 */

import axios from 'axios';

// User interface with role-based properties
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dispatcher' | 'driver';
  avatar: string;
  company?: string;
  phone?: string;
}

// Authentication response from the API
interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
}

// Mock users for development
const mockUsers: Record<string, User> = {
  'admin': {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin@towtrace.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin@towtrace.com',
    company: 'TowTrace LLC',
    phone: '(555) 123-4567'
  },
  'dispatcher': {
    id: 'user-dispatcher',
    name: 'Dispatch Manager',
    email: 'dispatch@towtrace.com',
    role: 'dispatcher',
    avatar: 'https://i.pravatar.cc/150?u=dispatch@towtrace.com',
    company: 'TowTrace LLC',
    phone: '(555) 765-4321'
  },
  'driver': {
    id: 'user-driver',
    name: 'Driver User',
    email: 'driver@towtrace.com',
    role: 'driver',
    avatar: 'https://i.pravatar.cc/150?u=driver@towtrace.com',
    company: 'TowTrace LLC',
    phone: '(555) 987-6543'
  }
};

// API URL for authentication
const API_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

// Helper function to store authentication data securely
const storeAuthData = (authData: AuthResponse): void => {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem('user', JSON.stringify(authData.user));
  sessionStorage.setItem('token', authData.token);
  sessionStorage.setItem('expiresAt', authData.expiresAt.toString());
};

// Helper function to remove authentication data
const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('expiresAt');
};

/**
 * Login with credentials or Google OAuth
 * In production, this would interact with the real API
 * For development, we use mock data
 */
export const login = async (email: string, password: string): Promise<User> => {
  // Development mode - use mock data
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      // Determine which mock user to return based on email
      let role = 'admin';
      if (email.includes('dispatch')) role = 'dispatcher';
      if (email.includes('driver')) role = 'driver';
      
      const user = mockUsers[role];
      
      // Mock auth response
      const authData: AuthResponse = {
        user,
        token: 'mock-jwt-token-for-development-only',
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };
      
      // Store auth data
      storeAuthData(authData);
      
      // Simulate API delay
      setTimeout(() => resolve(user), 500);
    });
  }
  
  // Production mode - call real API
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const authData: AuthResponse = response.data;
    storeAuthData(authData);
    return authData.user;
  } catch (error) {
    throw new Error('Authentication failed. Please check your credentials.');
  }
};

/**
 * Login with Google OAuth
 * In production, this would redirect to Google OAuth flow
 * For development, we mock the flow with a default admin user
 */
export const loginWithGoogle = async (): Promise<User> => {
  // For development, just use the mock admin user
  if (process.env.NODE_ENV === 'development') {
    return login('admin@towtrace.com', 'password');
  }
  
  // In production, we would redirect to Google OAuth
  // This is just a placeholder for the actual implementation
  window.location.href = `${API_URL}/auth/google`;
  return {} as User; // This line will never be reached in production
};

/**
 * Logout the current user
 * Clears session storage and redirects as needed
 */
export const logout = async (): Promise<void> => {
  // Development mode
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      clearAuthData();
      setTimeout(resolve, 300);
    });
  }
  
  // Production mode
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if the user is authenticated
 * Verifies token expiration as well
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const user = getCurrentUser();
  const expiresAt = sessionStorage.getItem('expiresAt');
  
  if (!user || !expiresAt) {
    return false;
  }
  
  // Check if token is expired
  return parseInt(expiresAt, 10) > Date.now();
};

/**
 * Get the authentication token
 * Returns null if not authenticated
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return sessionStorage.getItem('token');
};

/**
 * Check if the current user has a specific role
 */
export const hasRole = (role: User['role']): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Get the authorization header for API requests
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};