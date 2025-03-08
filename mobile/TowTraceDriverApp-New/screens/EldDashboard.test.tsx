import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EldDashboard from './EldDashboard';
import { EldService } from '../services/EldService';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../services/EldService');
jest.mock('@react-native-community/netinfo');
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    token: 'test-token',
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('EldDashboard', () => {
  // Sample data for tests
  const mockHosSummary = {
    current_status: 'on_duty',
    current_status_start_time: new Date().toISOString(),
    remaining_drive_time_minutes: 360, // 6 hours
    remaining_duty_time_minutes: 480, // 8 hours
    violations: [],
  };

  const mockHosLogs = [
    {
      id: '1',
      status: 'on_duty',
      start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      end_time: null,
      duration_minutes: 60,
    },
    {
      id: '2',
      status: 'off_duty',
      start_time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      end_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      duration_minutes: 60,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock NetInfo
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      callback({ isConnected: true });
      return { unsubscribe: jest.fn() };
    });
    
    // Mock ELD service
    (EldService.hasEldAccess as jest.Mock).mockResolvedValue(true);
    (EldService.getCurrentDriverHosSummary as jest.Mock).mockResolvedValue(mockHosSummary);
    (EldService.getDriverHosLogs as jest.Mock).mockResolvedValue(mockHosLogs);
    (EldService.syncOfflineHosUpdates as jest.Mock).mockResolvedValue(true);
    (EldService.updateHosStatus as jest.Mock).mockResolvedValue({});
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<EldDashboard />);
    expect(getByText('Loading ELD data...')).toBeTruthy();
  });

  it('renders subscription required message when no access', async () => {
    (EldService.hasEldAccess as jest.Mock).mockResolvedValue(false);
    
    const { findByText } = render(<EldDashboard />);
    
    expect(await findByText('This feature requires a Premium or Enterprise subscription.')).toBeTruthy();
  });

  it('renders dashboard with HOS summary when access is granted', async () => {
    const { findByText } = render(<EldDashboard />);
    
    expect(await findByText('ELD Dashboard')).toBeTruthy();
    expect(await findByText('Current Status')).toBeTruthy();
    
    // Verify HOS summary data is displayed
    expect(await findByText('ON DUTY')).toBeTruthy();
    expect(await findByText(/Drive Time Remaining/)).toBeTruthy();
    expect(await findByText(/6h 0m/)).toBeTruthy(); // 360 minutes = 6h 0m
  });

  it('shows offline message when not connected', async () => {
    // Mock offline state
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      callback({ isConnected: false });
      return { unsubscribe: jest.fn() };
    });
    
    const { findByText } = render(<EldDashboard />);
    
    expect(await findByText(/You are currently offline/)).toBeTruthy();
  });

  it('allows changing status', async () => {
    const { findByText } = render(<EldDashboard />);
    
    // Wait for dashboard to load
    await findByText('ELD Dashboard');
    
    // Press the Off Duty button
    fireEvent.press(await findByText('Off Duty'));
    
    // Verify the API was called
    expect(EldService.updateHosStatus).toHaveBeenCalledWith('off_duty');
    
    // Verify alert was shown
    expect(Alert.alert).toHaveBeenCalledWith('Success', expect.stringContaining('off duty'));
    
    // Verify data was reloaded
    expect(EldService.getCurrentDriverHosSummary).toHaveBeenCalledTimes(2);
  });

  it('handles offline status changes', async () => {
    // Set up for offline behavior
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      callback({ isConnected: false });
      return { unsubscribe: jest.fn() };
    });
    
    (EldService.updateHosStatus as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { findByText } = render(<EldDashboard />);
    
    // Wait for dashboard to load
    await findByText('ELD Dashboard');
    
    // Press the Off Duty button
    fireEvent.press(await findByText('Off Duty'));
    
    // Verify offline alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Offline Mode',
      expect.stringContaining('recorded and will be uploaded')
    );
  });

  it('shows HOS logs when View HOS Logs button is pressed', async () => {
    const { findByText } = render(<EldDashboard />);
    
    // Wait for dashboard to load
    await findByText('ELD Dashboard');
    
    // Press the View HOS Logs button
    fireEvent.press(await findByText('View HOS Logs'));
    
    // Modal should show up with logs
    expect(await findByText('Hours of Service Logs')).toBeTruthy();
    expect(await findByText('ON DUTY')).toBeTruthy();
    expect(await findByText('OFF DUTY')).toBeTruthy();
  });

  it('handles violations correctly', async () => {
    // Set up mock with violations
    const summaryWithViolations = {
      ...mockHosSummary,
      violations: [
        {
          type: 'drive_time',
          description: 'Exceeded maximum driving time',
        },
      ],
    };
    
    (EldService.getCurrentDriverHosSummary as jest.Mock).mockResolvedValue(summaryWithViolations);
    
    const { findByText } = render(<EldDashboard />);
    
    // Wait for dashboard to load
    await findByText('ELD Dashboard');
    
    // Violation section should be visible
    expect(await findByText('Violations')).toBeTruthy();
    expect(await findByText('DRIVE TIME')).toBeTruthy();
    expect(await findByText('Exceeded maximum driving time')).toBeTruthy();
  });

  it('handles errors when loading data', async () => {
    // Mock API error
    (EldService.getCurrentDriverHosSummary as jest.Mock).mockRejectedValue(new Error('API error'));
    
    const { findByText } = render(<EldDashboard />);
    
    // Wait for dashboard to load (error will be caught)
    await findByText('ELD Dashboard');
    
    // Error alert should have been shown
    expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('Failed to load ELD data'));
  });

  it('syncs offline updates when connection is restored', async () => {
    // Initially offline
    let connectionCallback: any;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      connectionCallback = callback;
      callback({ isConnected: false });
      return { unsubscribe: jest.fn() };
    });
    
    render(<EldDashboard />);
    
    // Now simulate connection restored
    connectionCallback({ isConnected: true });
    
    // Sync should have been called
    expect(EldService.syncOfflineHosUpdates).toHaveBeenCalled();
  });
});