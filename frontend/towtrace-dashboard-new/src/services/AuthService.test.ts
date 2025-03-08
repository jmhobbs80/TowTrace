/**
 * Unit tests for Auth Service
 */

import { User } from '@/app/context/auth-context';
import { 
  saveUserToStorage, 
  loadUserFromStorage, 
  clearUserFromStorage, 
  loginUser, 
  registerUser, 
  updateUser 
} from './AuthService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock setTimeout for API delay simulation
jest.useFakeTimers();

describe('AuthService', () => {
  // Sample user data for tests
  const mockUser: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    avatar: 'avatar.jpg',
    lastLogin: new Date().toISOString(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      weeklyReports: true,
      theme: 'light'
    }
  };
  
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  describe('Storage Functions', () => {
    it('should save user to storage', () => {
      saveUserToStorage(mockUser);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
    
    it('should load user from storage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      const loadedUser = loadUserFromStorage();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      expect(loadedUser).toEqual(mockUser);
    });
    
    it('should return null when no user in storage', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      const loadedUser = loadUserFromStorage();
      
      expect(loadedUser).toBeNull();
    });
    
    it('should handle JSON parse errors', () => {
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Set invalid JSON in storage
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');
      
      const loadedUser = loadUserFromStorage();
      
      expect(loadedUser).toBeNull();
      expect(console.error).toHaveBeenCalled();
      
      (console.error as jest.Mock).mockRestore();
    });
    
    it('should clear user from storage', () => {
      clearUserFromStorage();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
    
    it('should handle storage errors', () => {
      // Mock error during storage operations
      jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('Storage error'); });
      
      saveUserToStorage(mockUser);
      expect(console.error).toHaveBeenCalled();
      
      (console.error as jest.Mock).mockRestore();
    });
  });
  
  describe('loginUser', () => {
    it('should login admin users', async () => {
      const mockUsers = {
        admin: { ...mockUser, role: 'admin' },
        driver: { ...mockUser, role: 'driver' }
      };
      
      const result = loginUser('admin@example.com', 'password', mockUsers);
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const user = await result;
      
      expect(user.role).toBe('admin');
      expect(user.email).toBe('admin@example.com');
      expect(user.lastLogin).toBeDefined();
    });
    
    it('should login driver users', async () => {
      const mockUsers = {
        admin: { ...mockUser, role: 'admin' },
        driver: { ...mockUser, role: 'driver' }
      };
      
      const result = loginUser('driver@example.com', 'password', mockUsers);
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const user = await result;
      
      expect(user.role).toBe('driver');
      expect(user.email).toBe('driver@example.com');
    });
  });
  
  describe('registerUser', () => {
    it('should create a new user with provided data', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'driver' as const
      };
      
      const result = registerUser(userData, 'password');
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const newUser = await result;
      
      expect(newUser.name).toBe(userData.name);
      expect(newUser.email).toBe(userData.email);
      expect(newUser.role).toBe(userData.role);
      expect(newUser.id).toBeDefined();
      expect(newUser.avatar).toContain(userData.email);
      expect(newUser.lastLogin).toBeDefined();
      expect(newUser.preferences).toBeDefined();
    });
    
    it('should use default values for missing fields', async () => {
      const userData = {
        email: 'minimal@example.com'
      };
      
      const result = registerUser(userData, 'password');
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const newUser = await result;
      
      expect(newUser.name).toBe('');
      expect(newUser.email).toBe(userData.email);
      expect(newUser.role).toBe('driver'); // Default role
      expect(newUser.avatar).toBeDefined();
      expect(newUser.company).toBe('TowTrace Transport'); // Default company
    });
  });
  
  describe('updateUser', () => {
    it('should update user with provided changes', async () => {
      const updates = {
        name: 'Updated Name',
        phoneNumber: '555-1234'
      };
      
      const result = updateUser(mockUser, updates);
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const updatedUser = await result;
      
      expect(updatedUser.name).toBe(updates.name);
      expect(updatedUser.phoneNumber).toBe(updates.phoneNumber);
      expect(updatedUser.id).toBe(mockUser.id); // Unchanged fields remain
      expect(updatedUser.email).toBe(mockUser.email); // Unchanged fields remain
    });
    
    it('should update nested properties', async () => {
      const updates = {
        preferences: {
          ...mockUser.preferences!,
          theme: 'dark'
        }
      };
      
      const result = updateUser(mockUser, updates);
      
      // Fast-forward timers to resolve the delay promise
      jest.runAllTimers();
      
      const updatedUser = await result;
      
      expect(updatedUser.preferences!.theme).toBe('dark');
      expect(updatedUser.preferences!.emailNotifications).toBe(
        mockUser.preferences!.emailNotifications
      ); // Unchanged nested field
    });
  });
});