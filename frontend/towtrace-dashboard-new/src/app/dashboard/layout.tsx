'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';

// Navigation items - base items for all users
const getNavigationItems = (role: "admin" | "dispatcher" | "driver" | undefined) => {
  const baseItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Vehicles', href: '/dashboard/vehicles' },
    { name: 'Drivers', href: '/dashboard/drivers' },
    { name: 'Jobs', href: '/dashboard/jobs' },
    { name: 'Inspections', href: '/dashboard/inspections' },
    { name: 'Settings', href: '/dashboard/settings' },
  ];
  
  // Add admin-specific nav items
  if (role === 'admin') {
    return [
      ...baseItems,
      { name: 'ELD Logs', href: '/dashboard/eld-logs' },
      { name: 'Overwatch', href: '/dashboard/overwatch' },
    ];
  }
  
  return baseItems;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Handle mouse leave for user menu
  const handleMouseLeave = () => {
    setUserMenuOpen(false);
  };
  
  // Check authentication status
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('../login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Function to determine if a path is active
  const isActivePath = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    if (path !== '/dashboard' && pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirect to landing page instead of login
  };
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;
      
      // Format the path name (capitalize, replace hyphens)
      const name = path.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
      
      return {
        name,
        href,
        isLast
      };
    });
  };
  
  // Get page title from path
  const getPageTitle = () => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length === 1 && paths[0] === 'dashboard') {
      return 'Dashboard';
    }
    
    const lastPath = paths[paths.length - 1];
    return lastPath.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  };
  
  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin h-16 w-16 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden mr-2 p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
            
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                TT
              </div>
              <span className="ml-2 text-lg font-semibold">TowTrace</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {getNavigationItems(user?.role).map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActivePath(item.href) 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                } transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User Profile and Actions */}
          <div className="flex items-center">
            {/* Notification bell */}
            <button className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative ml-3" onMouseLeave={handleMouseLeave}>
              <button
                type="button"
                className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onMouseEnter={() => setUserMenuOpen(true)}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 border border-gray-200 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block ml-2 text-sm font-medium text-gray-700 truncate max-w-[100px]">
                  {user?.name || 'User'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 ml-1 text-gray-400">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Your Profile
                  </Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/dashboard/settings/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Manage Users
                      </Link>
                      <Link href="/dashboard/eld-logs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        View ELD Logs
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full">
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white animate-slide-in-right">
              {/* User info */}
              <div className="px-4 pt-5 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <span className="text-primary-700 font-semibold">
                        {user?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.role}</div>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto pt-2">
                <nav className="px-2 space-y-1">
                  {getNavigationItems(user?.role).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${
                        isActivePath(item.href)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Logout button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-5 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="text-gray-500 hover:text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Home</span>
              </Link>
            </li>
            
            {generateBreadcrumbs().slice(1).map((breadcrumb, index) => (
              <li key={breadcrumb.href}>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-300">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                  {breadcrumb.isLast ? (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link href={breadcrumb.href} className="ml-1 text-sm font-medium text-gray-500 hover:text-primary-600 md:ml-2">
                      {breadcrumb.name}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{getPageTitle()}</h1>
        
        {/* Page Content */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              &copy; {new Date().getFullYear()} TowTrace. All rights reserved.
            </div>
            <div className="mt-2 md:mt-0">
              <Link href="#" className="text-primary-600 hover:text-primary-700 mr-4">
                Privacy Policy
              </Link>
              <Link href="#" className="text-primary-600 hover:text-primary-700 mr-4">
                Terms of Service
              </Link>
              <Link href="#" className="text-primary-600 hover:text-primary-700">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}