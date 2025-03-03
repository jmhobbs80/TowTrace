'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user interface - expand as needed
interface User {
  name?: string;
  email?: string;
  role?: string;
  sub?: string;
  picture?: string;
}

// Define AuthContext interface
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: Error | null;
  login: () => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
  login: () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps app and makes auth available 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        // For development, create a mock user
        if (process.env.NODE_ENV === 'development') {
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Set mock user for development
          setUser({
            name: 'Development User',
            email: 'dev@towtrace.com',
            role: 'admin',
            sub: 'dev-user-id-123',
            picture: 'https://i.pravatar.cc/150?u=dev@towtrace.com'
          });
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // In production, fetch the user from the session
        const res = await fetch('/api/auth/me');
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (res.status !== 401) {
          // If not 401 (unauthorized), then something went wrong
          throw new Error('Failed to fetch user data');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  // Login function
  const login = () => {
    // Redirect to login page
    window.location.href = '/api/auth/login';
  };

  // Logout function
  const logout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/auth/logout';
  };

  // Context value
  const value = {
    isLoading,
    isAuthenticated,
    user,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}