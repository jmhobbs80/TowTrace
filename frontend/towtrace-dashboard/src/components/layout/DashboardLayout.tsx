import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCurrentUser, User, logout, hasRole } from '../../lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideTitle?: boolean;
  fullWidth?: boolean;
}

/**
 * DashboardLayout Component
 * Main layout for all authenticated dashboard pages
 * Features:
 * - Responsive navigation with mobile support
 * - User profile and logout
 * - Role-based navigation items
 * - Styled with Apple-inspired design system
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard',
  hideTitle = false,
  fullWidth = false
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Get current user from auth utility
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      // Redirect to login if not authenticated
      router.push('/login');
    } else {
      setUser(currentUser);
      setIsLoading(false);
    }
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    // Base navigation items for all users
    const items = [
      { name: 'Dashboard', href: '/dashboard', current: router.pathname === '/dashboard' },
      { name: 'Jobs', href: '/dashboard/jobs', current: router.pathname.startsWith('/dashboard/jobs') },
      { name: 'Vehicles', href: '/dashboard/vehicles', current: router.pathname.startsWith('/dashboard/vehicles') },
    ];
    
    // Role-specific navigation items
    if (user) {
      if (user.role === 'admin' || user.role === 'dispatcher') {
        items.push({ 
          name: 'Drivers', 
          href: '/dashboard/drivers', 
          current: router.pathname.startsWith('/dashboard/drivers') 
        });
        items.push({ 
          name: 'Fleet Tracker', 
          href: '/dashboard/fleet', 
          current: router.pathname.startsWith('/dashboard/fleet') 
        });
      }
      
      if (user.role === 'admin') {
        items.push({ 
          name: 'QuickBooks', 
          href: '/dashboard/quickbooks', 
          current: router.pathname.startsWith('/dashboard/quickbooks') 
        });
        items.push({ 
          name: 'Settings', 
          href: '/dashboard/settings', 
          current: router.pathname.startsWith('/dashboard/settings') 
        });
      }
      
      // Driver-specific items
      if (user.role === 'driver') {
        items.push({ 
          name: 'Inspections', 
          href: '/dashboard/inspections', 
          current: router.pathname.startsWith('/dashboard/inspections') 
        });
      }
    }
    
    return items;
  };
  
  // Secondary navigation (bottom of sidebar)
  const secondaryNavigation = [
    { name: 'Help', href: '/dashboard/help' },
    { name: 'Privacy', href: '/dashboard/privacy' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
            TT
          </div>
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu - Off-canvas menu for mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    TT
                  </div>
                  <span className="ml-2 text-xl font-semibold">TowTrace</span>
                </Link>
              </div>
              <nav aria-label="Sidebar" className="mt-5">
                <div className="px-2 space-y-1">
                  {getNavigationItems().map((item) => (
                    <Link 
                      href={item.href} 
                      key={item.name}
                      className={`${
                        item.current
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <hr className="border-t border-gray-200 my-5" />
                <div className="px-2 space-y-1">
                  {secondaryNavigation.map((item) => (
                    <Link 
                      href={item.href} 
                      key={item.name}
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
            
            {/* Mobile user menu */}
            {user && (
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">{user.name}</p>
                    <p className="text-sm font-medium text-gray-500 capitalize">{user.role}</p>
                    <button
                      onClick={handleLogout}
                      className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link 
                href="/dashboard"
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  TT
                </div>
                <span className="ml-2 text-xl font-semibold">TowTrace</span>
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1" aria-label="Sidebar">
              {getNavigationItems().map((item) => (
                <Link 
                  href={item.href} 
                  key={item.name}
                  className={`${
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={user?.avatar}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                <button
                  onClick={handleLogout}
                  className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-filter backdrop-blur flex-shrink-0 border-b border-gray-200">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Menu button */}
            <button
              type="button"
              className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Logo visible on mobile */}
            <div className="lg:hidden flex items-center">
              <Link href="/dashboard">
                <a className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
                    TT
                  </div>
                  <span className="ml-2 text-lg font-semibold">TowTrace</span>
                </a>
              </Link>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4 sm:ml-6 sm:space-x-6">
              {/* Notification bell */}
              <button 
                type="button" 
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification badge */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              {/* Profile dropdown */}
              <div className="relative">
                <button 
                  type="button" 
                  className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <img 
                    className="h-8 w-8 rounded-full bg-gray-300" 
                    src={user?.avatar} 
                    alt="" 
                  />
                </button>
                
                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Link href="/dashboard/profile">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                    </Link>
                    <Link href="/dashboard/settings">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className={`py-6 ${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
            {!hideTitle && (
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;