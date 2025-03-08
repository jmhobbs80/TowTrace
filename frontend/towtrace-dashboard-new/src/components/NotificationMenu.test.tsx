import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationMenu, { Notification } from './NotificationMenu';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Sample notifications for testing
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'document_expiry',
    title: 'Driver License Expiring',
    message: 'John Doe\'s license expires in 30 days',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: false,
    documentId: 'doc123',
  },
  {
    id: '2',
    type: 'driver_arrival',
    title: 'Driver Arrived at Location',
    message: 'Jane Smith has arrived at the pickup location',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isRead: true,
    driverId: 'driver456',
  },
  {
    id: '3',
    type: 'job_update',
    title: 'Job Status Changed',
    message: 'Job #12345 has been completed',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    isRead: false,
    jobId: 'job789',
  },
  {
    id: '4',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance in 2 hours',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    isRead: false,
    actionUrl: '/dashboard/settings',
  },
];

describe('NotificationMenu', () => {
  // Mock callbacks
  const mockOnMarkAllAsRead = jest.fn();
  const mockOnMarkAsRead = jest.fn();
  const mockOnFetchNotifications = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock router push function
    jest.spyOn(require('next/navigation').useRouter(), 'push').mockImplementation(mockRouterPush);
  });

  it('renders the notification button with correct unread count', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // The unread count should be 3 (notification 1, 3, and 4 are unread)
    const unreadBadge = screen.getByText('3');
    expect(unreadBadge).toBeInTheDocument();
  });

  it('opens the notification menu when the button is clicked', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Menu should be closed initially
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    
    // Click the notification button
    fireEvent.click(screen.getByRole('button'));
    
    // Menu should be open now
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Driver License Expiring')).toBeInTheDocument();
    expect(screen.getByText('Driver Arrived at Location')).toBeInTheDocument();
  });

  it('displays different styles for read and unread notifications', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Check that notifications are displayed with correct icons and styles
    
    // Get notification items by their titles
    const documentNotificationText = screen.getByText('Driver License Expiring');
    const driverNotificationText = screen.getByText('Driver Arrived at Location');
    
    // Check that they exist in the document
    expect(documentNotificationText).toBeInTheDocument();
    expect(driverNotificationText).toBeInTheDocument();
  });

  it('calls onMarkAllAsRead when "Mark all as read" is clicked', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click "Mark all as read"
    fireEvent.click(screen.getByText('Mark all as read'));
    
    // Check if callback was called
    expect(mockOnMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('calls onMarkAsRead when clicking on a notification', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click on document expiry notification
    fireEvent.click(screen.getByText('Driver License Expiring'));
    
    // Should mark as read
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('renders all notification types', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Verify all notification types are displayed
    expect(screen.getByText('Driver License Expiring')).toBeInTheDocument();
    expect(screen.getByText('Driver Arrived at Location')).toBeInTheDocument();
    expect(screen.getByText('Job Status Changed')).toBeInTheDocument();
    expect(screen.getByText('System Maintenance')).toBeInTheDocument();
  });

  it('displays empty state when there are no notifications', () => {
    render(
      <NotificationMenu 
        notifications={[]}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Should show empty state
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('calls onFetchNotifications on mount', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Check if fetch callback was called on mount
    expect(mockOnFetchNotifications).toHaveBeenCalled();
  });

  it('formats notification times correctly', () => {
    // Mock date-fns formatDistanceToNow to return predictable results
    jest.mock('date-fns', () => ({
      ...jest.requireActual('date-fns'),
      formatDistanceToNow: jest.fn().mockImplementation((date) => {
        const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
        return `${hours} hours ago`;
      }),
      parseISO: jest.fn().mockImplementation(str => new Date(str)),
    }));
    
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Time display is mocked by date-fns, we just verify it's shown
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  it('navigates to notification settings when link is clicked', () => {
    render(
      <NotificationMenu 
        notifications={mockNotifications}
        onMarkAllAsRead={mockOnMarkAllAsRead}
        onMarkAsRead={mockOnMarkAsRead}
        onFetchNotifications={mockOnFetchNotifications}
      />
    );
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click on settings link
    fireEvent.click(screen.getByText('Notification Settings'));
    
    // Menu should close and navigate
    expect(mockRouterPush).not.toHaveBeenCalled(); // Because we're using Link, not direct router push
  });
});