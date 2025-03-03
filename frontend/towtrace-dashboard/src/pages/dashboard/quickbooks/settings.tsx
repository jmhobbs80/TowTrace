import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { QuickBooksAPI } from '../../../lib/api';

/**
 * QuickBooks Integration Settings
 * Allows configuring QuickBooks integration settings
 */
export default function QuickBooksSettings() {
  const router = useRouter();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    autoSync: true,
    syncFrequency: 'daily',
    syncItems: {
      invoices: true,
      customers: true,
      items: true,
      payments: true,
      expenses: false
    },
    invoicePrefix: 'TOW-',
    invoiceNotes: 'Thank you for your business!',
    defaultRate: 95.00
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get QuickBooks connection status
        const connectionResponse = await QuickBooksAPI.getConnectionStatus();
        setConnection(connectionResponse.data);
        
        // Mock fetch of settings - in a real implementation, this would come from the API
        // This is a placeholder for now
        setFormData({
          autoSync: true,
          syncFrequency: 'daily',
          syncItems: {
            invoices: true,
            customers: true,
            items: true,
            payments: true,
            expenses: false
          },
          invoicePrefix: 'TOW-',
          invoiceNotes: 'Thank you for your business!',
          defaultRate: 95.00
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching QuickBooks settings:', err);
        setError('Failed to load QuickBooks settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('syncItems.')) {
      const itemName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        syncItems: {
          ...prev.syncItems,
          [itemName]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message or redirect
      router.push('/dashboard/quickbooks');
      
    } catch (err) {
      console.error('Error saving QuickBooks settings:', err);
      setError('Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>QuickBooks Settings | TowTrace</title>
        <meta name="description" content="Configure QuickBooks integration settings" />
      </Head>

      <DashboardLayout title="QuickBooks Settings">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dashboard/quickbooks">
            <a className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to QuickBooks Integration
            </a>
          </Link>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Connection Status */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Connection Status</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your current QuickBooks connection status
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${connection?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {connection?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {connection?.connected ? (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{connection.companyName}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Actions</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Disconnect
                        </button>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">
                      You need to connect your QuickBooks account to use the integration features.
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Connect QuickBooks
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sync Settings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Synchronization Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure how and when data is synced with QuickBooks
                </p>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Auto Sync Toggle */}
                  <div className="sm:col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="autoSync"
                          name="autoSync"
                          type="checkbox"
                          checked={formData.autoSync}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="autoSync" className="font-medium text-gray-700">Enable Automatic Synchronization</label>
                        <p className="text-gray-500">Automatically sync data with QuickBooks on a regular schedule</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sync Frequency */}
                  {formData.autoSync && (
                    <div className="sm:col-span-3">
                      <label htmlFor="syncFrequency" className="block text-sm font-medium text-gray-700">
                        Sync Frequency
                      </label>
                      <select
                        id="syncFrequency"
                        name="syncFrequency"
                        value={formData.syncFrequency}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Items to Sync */}
                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="text-base font-medium text-gray-700">Items to Synchronize</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center">
                          <input
                            id="syncItems.invoices"
                            name="syncItems.invoices"
                            type="checkbox"
                            checked={formData.syncItems.invoices}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="syncItems.invoices" className="ml-3 block text-sm font-medium text-gray-700">
                            Invoices
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="syncItems.customers"
                            name="syncItems.customers"
                            type="checkbox"
                            checked={formData.syncItems.customers}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="syncItems.customers" className="ml-3 block text-sm font-medium text-gray-700">
                            Customers
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="syncItems.items"
                            name="syncItems.items"
                            type="checkbox"
                            checked={formData.syncItems.items}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="syncItems.items" className="ml-3 block text-sm font-medium text-gray-700">
                            Items & Services
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="syncItems.payments"
                            name="syncItems.payments"
                            type="checkbox"
                            checked={formData.syncItems.payments}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="syncItems.payments" className="ml-3 block text-sm font-medium text-gray-700">
                            Payments
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="syncItems.expenses"
                            name="syncItems.expenses"
                            type="checkbox"
                            checked={formData.syncItems.expenses}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="syncItems.expenses" className="ml-3 block text-sm font-medium text-gray-700">
                            Expenses
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoice Settings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure settings for automatically generated invoices
                </p>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Invoice Prefix */}
                  <div className="sm:col-span-3">
                    <label htmlFor="invoicePrefix" className="block text-sm font-medium text-gray-700">
                      Invoice Prefix
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="invoicePrefix"
                        id="invoicePrefix"
                        value={formData.invoicePrefix}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="TOW-"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Prefix added to automatically generated invoice numbers
                    </p>
                  </div>
                  
                  {/* Default Hourly Rate */}
                  <div className="sm:col-span-3">
                    <label htmlFor="defaultRate" className="block text-sm font-medium text-gray-700">
                      Default Hourly Rate
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="defaultRate"
                        id="defaultRate"
                        value={formData.defaultRate}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Default hourly rate for services when not specified
                    </p>
                  </div>
                  
                  {/* Invoice Notes */}
                  <div className="sm:col-span-6">
                    <label htmlFor="invoiceNotes" className="block text-sm font-medium text-gray-700">
                      Default Invoice Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="invoiceNotes"
                        name="invoiceNotes"
                        rows={3}
                        value={formData.invoiceNotes}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter default notes to appear on all invoices"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      These notes will appear on all automatically generated invoices
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Link href="/dashboard/quickbooks">
                <a className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cancel
                </a>
              </Link>
              <button
                type="submit"
                disabled={saving || !connection?.connected}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (saving || !connection?.connected) ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        )}
      </DashboardLayout>
    </>
  );
}