/**
 * Tests for the Authentication Context
 */

import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import * as AuthService from '@/services/AuthService';
import * as GPSService from '@/services/GPSTrackingService';

// Mock our service dependencies
jest.mock('@/services/AuthService');
jest.mock('@/services/GPSTrackingService');

// Test component that consumes the auth context
function TestComponent() {
  const { user, login, logout, signup, updateUserProfile, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      
      {user && (
        <div data-testid="user-info">
          <p data-testid="user-name">{user.name}</p>
          <p data-testid="user-email">{user.email}</p>
          <p data-testid="user-role">{user.role}</p>
        </div>
      )}
      
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
      
      <button 
        data-testid="signup-button" 
        onClick={() => signup({ name: 'New User', email: 'new@example.com' }, 'password')}
      >
        Signup
      </button>
      
      <button 
        data-testid="update-button" 
        onClick={() => updateUserProfile({ name: 'Updated Name' })}
      >
        Update
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    lastLogin: new Date().toISOString()
  };
  
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Default mock implementations
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(null);
    (AuthService.registerUser as jest.Mock).mockResolvedValue(mockUser);
    (AuthService.loginUser as jest.Mock).mockResolvedValue(mockUser);
  });
  
  it('should render children and provide auth context', async () => {
    // Mock to return null so we're not authenticated
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(null);
    
    const { findByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Should render auth buttons
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
    
    // Check authentication state (may be loading first)
    await findByText(/Authenticated|Not Authenticated/);
  });
  
  it('should load user from storage on mount', async () => {
    // Mock a user in storage
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(AuthService.loadUserFromStorage).toHaveBeenCalled();
    expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
    expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
  });
  
  it('should handle login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(AuthService.loginUser).toHaveBeenCalledWith(
      'test@example.com', 
      'password', 
      expect.anything()
    );
    expect(AuthService.saveUserToStorage).toHaveBeenCalledWith(mockUser);
    
    expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
  });
  
  it('should handle logout', async () => {
    // Mock a user in storage
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for auth state to update after mount
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Wait for auth state to update after logout
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    
    expect(AuthService.clearUserFromStorage).toHaveBeenCalled();
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });
  
  it('should handle signup', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click signup button
    fireEvent.click(screen.getByTestId('signup-button'));
    
    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(AuthService.registerUser).toHaveBeenCalledWith(
      { name: 'New User', email: 'new@example.com' }, 
      'password'
    );
    expect(AuthService.saveUserToStorage).toHaveBeenCalledWith(mockUser);
    
    expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
  });
  
  it('should handle profile updates', async () => {
    // Mock user in storage
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(mockUser);
    
    // Mock update response
    const updatedUser = { ...mockUser, name: 'Updated Name' };
    (AuthService.updateUser as jest.Mock).mockResolvedValue(updatedUser);
    
    // Mock GPS functions
    (GPSService.handleGPSStatusChange as jest.Mock).mockReturnValue(true);
    (GPSService.simulateLocationUpdate as jest.Mock).mockImplementation(user => user);
    (GPSService.checkLocationArrival as jest.Mock).mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Click update button
    fireEvent.click(screen.getByTestId('update-button'));
    
    // Wait for user info to update
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
    });
    
    expect(AuthService.updateUser).toHaveBeenCalledWith(
      mockUser, 
      { name: 'Updated Name' }
    );
    expect(AuthService.saveUserToStorage).toHaveBeenCalledWith(updatedUser);
  });
  
  it('should handle status update with GPS changes', async () => {
    // Mock user in storage
    (AuthService.loadUserFromStorage as jest.Mock).mockReturnValue(mockUser);
    
    // Mock update with status change
    const updatedUser = { ...mockUser, status: 'On Duty' };
    (AuthService.updateUser as jest.Mock).mockResolvedValue(updatedUser);
    
    // Mock GPS functions
    (GPSService.handleGPSStatusChange as jest.Mock).mockReturnValue(true);
    (GPSService.simulateLocationUpdate as jest.Mock).mockImplementation(user => user);
    (GPSService.checkLocationArrival as jest.Mock).mockReturnValue(null);
    
    const { findByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial auth state
    await findByTestId('auth-status');
    
    // Click the update button which will update the profile
    fireEvent.click(screen.getByTestId('update-button'));
    
    // Wait for the update to process
    await waitFor(() => {
      expect(AuthService.updateUser).toHaveBeenCalled();
    });
  });
});