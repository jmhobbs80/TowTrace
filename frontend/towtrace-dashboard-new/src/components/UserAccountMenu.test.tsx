import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserAccountMenu from './UserAccountMenu';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('UserAccountMenu', () => {
  const mockLogout = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock router push function
    jest.spyOn(require('next/navigation').useRouter(), 'push').mockImplementation(mockRouterPush);
  });

  it('renders the user account button with default props', () => {
    render(<UserAccountMenu />);
    
    // Should display the user initials by default
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders the user account button with custom props', () => {
    render(
      <UserAccountMenu 
        userName="John Doe"
        userEmail="john@example.com"
        userRole="driver"
      />
    );
    
    // Should display the user initials
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('opens the menu when clicking the button', () => {
    render(<UserAccountMenu userName="John Doe" />);
    
    // Menu should be closed initially
    expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
    
    // Click the account button
    fireEvent.click(screen.getByRole('button'));
    
    // Menu should be open now
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe')).toHaveLength(2); // One in the button, one in the menu
  });

  it('displays different menu items based on user role', () => {
    render(<UserAccountMenu userRole="admin" />);
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Check for admin-specific items
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('calls onLogout when clicking the logout button', () => {
    render(<UserAccountMenu onLogout={mockLogout} />);
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Click logout
    fireEvent.click(screen.getByText('Sign out'));
    
    // Check if logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('gets profile button in menu', () => {
    render(<UserAccountMenu />);
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Verify the button is there
    const profileButton = screen.getByRole('menuitem', { name: 'Your Profile' });
    expect(profileButton).toBeInTheDocument();
  });

  it('renders user avatar when provided', () => {
    render(
      <UserAccountMenu 
        userName="John Doe"
        userAvatar="/test-avatar.jpg"
      />
    );
    
    // Should display the avatar image
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
  });

  it('closes the menu when clicking outside', () => {
    render(<UserAccountMenu />);
    
    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    
    // Menu should be open
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    
    // Simulate a click outside
    fireEvent.mouseDown(document.body);
    
    // Menu should be closed
    expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
  });
});