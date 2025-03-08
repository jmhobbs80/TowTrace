import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import useAuth from './useAuth';
import { AuthContext } from '../App';
import { AuthContextType } from '../types';

// Create a wrapper component with AuthContext
const createWrapper = (contextValue: AuthContextType) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useAuth hook', () => {
  // Sample auth data
  const mockAuthContext: AuthContextType = {
    token: 'test-token',
    setToken: jest.fn(),
    isLoading: false,
    logout: jest.fn(),
    subscription: 'premium',
    hasEldAccess: true,
  };

  it('returns the auth context when used within AuthProvider', () => {
    const wrapper = createWrapper(mockAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBe('test-token');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.subscription).toBe('premium');
    expect(result.current.hasEldAccess).toBe(true);
  });

  it('throws an error when used outside AuthProvider', () => {
    // Using a spy to silence the error in the console during the test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Rendering without a wrapper will cause it to use default undefined context
    expect(() => {
      const { result } = renderHook(() => useAuth());
      // Access any property to trigger the error
      const token = result.current.token;
    }).toThrow('useAuth must be used within an AuthProvider');

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  it('calls logout function when logout is called', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    const authContext = { ...mockAuthContext, logout: mockLogout };
    
    const wrapper = createWrapper(authContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('calls setToken function when token is set', () => {
    const mockSetToken = jest.fn();
    const authContext = { ...mockAuthContext, setToken: mockSetToken };
    
    const wrapper = createWrapper(authContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setToken('new-token');
    });

    expect(mockSetToken).toHaveBeenCalledWith('new-token');
  });

  it('returns subscription status correctly', () => {
    // Test with basic subscription
    const basicWrapper = createWrapper({ ...mockAuthContext, subscription: 'basic' });
    const { result: basicResult } = renderHook(() => useAuth(), { wrapper: basicWrapper });
    expect(basicResult.current.subscription).toBe('basic');
    
    // Test with enterprise subscription
    const enterpriseWrapper = createWrapper({ ...mockAuthContext, subscription: 'enterprise' });
    const { result: enterpriseResult } = renderHook(() => useAuth(), { wrapper: enterpriseWrapper });
    expect(enterpriseResult.current.subscription).toBe('enterprise');
  });

  it('returns ELD access status correctly', () => {
    // Test with ELD access
    const eldAccessWrapper = createWrapper({ ...mockAuthContext, hasEldAccess: true });
    const { result: accessResult } = renderHook(() => useAuth(), { wrapper: eldAccessWrapper });
    expect(accessResult.current.hasEldAccess).toBe(true);
    
    // Test without ELD access
    const noEldAccessWrapper = createWrapper({ ...mockAuthContext, hasEldAccess: false });
    const { result: noAccessResult } = renderHook(() => useAuth(), { wrapper: noEldAccessWrapper });
    expect(noAccessResult.current.hasEldAccess).toBe(false);
  });
});