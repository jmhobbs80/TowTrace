/**
 * Authentication Service for TowTrace
 * 
 * Handles user authentication, profile management, and storage of user data.
 */

import { User } from '@/app/context/auth-context';

// API simulation constants
const AUTH_DELAY_MS = 1000;
const SIGNUP_DELAY_MS = 1500;

// Storage keys
const USER_STORAGE_KEY = 'user';

/**
 * Save user data to persistent storage
 * 
 * @param {User} userData - User data to persist
 */
export const saveUserToStorage = (userData: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data to storage:', error);
  }
};

/**
 * Load user data from persistent storage
 * 
 * @returns {User|null} User data if found, null otherwise
 */
export const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error loading user data from storage:', error);
    return null;
  }
};

/**
 * Remove user data from persistent storage (for logout)
 */
export const clearUserFromStorage = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user data from storage:', error);
  }
};

/**
 * Authenticate user with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<User>} Authenticated user data
 */
export const loginUser = async (email: string, password: string, mockUsers: Record<string, User>): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS));
  
  // In a real implementation, this would make an API call
  // For now we're using mock data
  
  // Check if email corresponds to a driver or admin account
  if (email.includes('driver')) {
    return { 
      ...mockUsers.driver, 
      lastLogin: new Date().toISOString(),
      email: email 
    };
  } else {
    return { 
      ...mockUsers.admin, 
      lastLogin: new Date().toISOString(),
      email: email 
    };
  }
};

/**
 * Register a new user
 * 
 * @param {Partial<User>} userData - New user data
 * @param {string} password - User password
 * @returns {Promise<User>} Created user data
 */
export const registerUser = async (userData: Partial<User>, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIGNUP_DELAY_MS));
  
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
  
  return newUser;
};

/**
 * Update user profile
 * 
 * @param {User} currentUser - Current user data
 * @param {Partial<User>} updates - Fields to update
 * @returns {Promise<User>} Updated user data
 */
export const updateUser = async (currentUser: User, updates: Partial<User>): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, AUTH_DELAY_MS));
  
  // In a real implementation, this would make an API call
  return { ...currentUser, ...updates };
};