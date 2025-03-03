'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/auth-provider';

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  // Only render dashboard content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                TT
              </div>
              <span className="ml-2 text-xl font-semibold">TowTrace</span>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center mr-4">
                  <img
                    src={user.picture || 'https://i.pravatar.cc/150?u=default'}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <span className="text-sm font-medium">{user.name || 'User'}</span>
                </div>
              )}
              <button
                onClick={() => window.location.href = '/api/auth/logout'}
                className="btn btn-secondary text-sm px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-2">Active Jobs</h3>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-gray-500 mt-1">3 in progress, 9 scheduled</p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-2">Vehicles</h3>
              <p className="text-3xl font-bold">42</p>
              <p className="text-sm text-gray-500 mt-1">12 in transit, 30 stored</p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-2">Drivers</h3>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-gray-500 mt-1">5 active, 3 off-duty</p>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            Job #{1000 + item} updated
                          </div>
                          <div className="text-sm text-gray-500">
                            Driver marked pickup complete for Honda Civic (VIN: 1HGCM82633A123456)
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item} hour{item !== 1 ? 's' : ''} ago
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* QuickBooks Integration Notice */}
          <div className="mt-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Your QuickBooks integration is not set up yet. 
                    <a href="/api/quickbooks/connect" className="font-medium underline ml-1">
                      Connect QuickBooks
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}