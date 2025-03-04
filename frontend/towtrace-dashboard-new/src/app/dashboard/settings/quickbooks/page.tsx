'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/auth-context';

// Mock sync history data
const initialSyncHistory = [
  { 
    id: '1', 
    date: '2025-03-03T14:30:00Z', 
    status: 'success', 
    entity: 'invoices', 
    records: 23, 
    message: 'Successfully synced 23 invoices' 
  },
  { 
    id: '2', 
    date: '2025-03-02T10:15:00Z', 
    status: 'success', 
    entity: 'customers', 
    records: 5, 
    message: 'Successfully synced 5 customers' 
  },
  { 
    id: '3', 
    date: '2025-03-01T08:45:00Z', 
    status: 'error', 
    entity: 'invoices', 
    records: 0, 
    message: 'Authentication error: Token expired' 
  },
];

export default function QuickBooksIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 'daily',
    syncInvoices: true,
    syncPayments: true,
    syncCustomers: true,
  });
  const [syncHistory, setSyncHistory] = useState(initialSyncHistory);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate loading connection status
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      // In a real implementation, this would call your backend API
      // to check if this tenant has a valid QuickBooks connection
      setTimeout(() => {
        setIsConnected(true); // Mock status - would come from API
        setIsLoading(false);
      }, 1000);
    };

    fetchConnectionStatus();
  }, []);

  // Handle connect to QuickBooks
  const handleConnect = async () => {
    // In a real implementation, this would redirect to QuickBooks OAuth flow
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  // Handle disconnect from QuickBooks
  const handleDisconnect = async () => {
    // In a real implementation, this would call your backend to revoke tokens
    if (window.confirm('Are you sure you want to disconnect from QuickBooks? This will stop all automatic syncing.')) {
      setIsLoading(true);
      setTimeout(() => {
        setIsConnected(false);
        setIsLoading(false);
      }, 1500);
    }
  };

  // Handle saving sync settings
  const handleSaveSettings = () => {
    // In a real implementation, this would call your backend API to update settings
    alert('Sync settings saved successfully');
  };

  // Handle manual sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    
    // In a real implementation, this would call your backend API to trigger a sync
    setTimeout(() => {
      // Add a new sync record to history
      const newSyncRecord = {
        id: (syncHistory.length + 1).toString(),
        date: new Date().toISOString(),
        status: 'success',
        entity: 'all',
        records: 18,
        message: 'Successfully synced 18 records'
      };
      
      setSyncHistory([newSyncRecord, ...syncHistory]);
      setIsSyncing(false);
    }, 2000);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          QuickBooks Integration
        </h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need administrator privileges to access QuickBooks integration settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          QuickBooks Integration
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your TowTrace account with QuickBooks to automatically sync invoices, payments, and customer data.
        </p>
      </div>

      {/* Connection Status */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-primary-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Checking connection status...</span>
          </div>
        ) : isConnected ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <span className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Connected to QuickBooks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your TowTrace account is successfully connected to QuickBooks.
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Disconnect from QuickBooks
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <span className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Not Connected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect your TowTrace account to QuickBooks to enable automatic syncing.
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleConnect}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Connect to QuickBooks
            </button>
          </div>
        )}
      </div>

      {/* Sync Settings */}
      {isConnected && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sync Settings</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="autoSync" className="text-sm font-medium text-gray-700">Automatic Syncing</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={syncSettings.autoSync}
                    onChange={(e) => setSyncSettings({ ...syncSettings, autoSync: e.target.checked })}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="autoSync"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${syncSettings.autoSync ? 'bg-primary-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                When enabled, data will be automatically synced between TowTrace and QuickBooks.
              </p>
            </div>
            
            {syncSettings.autoSync && (
              <div className="ml-6">
                <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Frequency
                </label>
                <select
                  id="syncInterval"
                  name="syncInterval"
                  value={syncSettings.syncInterval}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncInterval: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="hourly">Every hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Data to Sync</h3>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="syncInvoices"
                    name="syncInvoices"
                    type="checkbox"
                    checked={syncSettings.syncInvoices}
                    onChange={(e) => setSyncSettings({ ...syncSettings, syncInvoices: e.target.checked })}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="syncInvoices" className="font-medium text-gray-700">Invoices</label>
                  <p className="text-gray-500">Sync all invoices from TowTrace to QuickBooks</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="syncPayments"
                    name="syncPayments"
                    type="checkbox"
                    checked={syncSettings.syncPayments}
                    onChange={(e) => setSyncSettings({ ...syncSettings, syncPayments: e.target.checked })}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="syncPayments" className="font-medium text-gray-700">Payments</label>
                  <p className="text-gray-500">Sync payment records from TowTrace to QuickBooks</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="syncCustomers"
                    name="syncCustomers"
                    type="checkbox"
                    checked={syncSettings.syncCustomers}
                    onChange={(e) => setSyncSettings({ ...syncSettings, syncCustomers: e.target.checked })}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="syncCustomers" className="font-medium text-gray-700">Customers</label>
                  <p className="text-gray-500">Sync customer data from TowTrace to QuickBooks</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sync */}
      {isConnected && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Manual Sync</h2>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Now
                </>
              )}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manually trigger a sync between TowTrace and QuickBooks.
          </p>
        </div>
      )}

      {/* Sync History */}
      {isConnected && (
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sync History</h2>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncHistory.map((sync) => (
                  <tr key={sync.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sync.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sync.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sync.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sync.entity === 'all' ? 'All Entities' : sync.entity.charAt(0).toUpperCase() + sync.entity.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sync.records}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {sync.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {syncHistory.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No sync history available.
            </div>
          )}
        </div>
      )}

      {/* Add custom styles for toggle switch */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:not(:checked) {
          right: 4px;
          border-color: #e5e7eb;
        }
        .toggle-label {
          transition: background-color 0.2s;
        }
      `}</style>
    </div>
  );
}