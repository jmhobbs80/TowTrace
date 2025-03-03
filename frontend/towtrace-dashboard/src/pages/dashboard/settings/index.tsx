import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getCurrentUser, hasRole, User } from '../../../lib/auth';

/**
 * Settings Page
 * Global application settings and configuration
 */
export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Form state - General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'TowTrace LLC',
    contactEmail: 'support@towtrace.com',
    contactPhone: '(555) 123-4567',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    defaultCurrency: 'USD'
  });
  
  // Form state - Display settings
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    highContrastMode: false,
    largeText: false,
    compactView: false
  });
  
  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Check if user has admin access
      if (!hasRole('admin')) {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  }, [router]);

  // Handle general settings form change
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle display settings toggle
  const handleDisplayToggle = (setting: keyof typeof displaySettings) => {
    setDisplaySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // In a real app, this would call the API to update the settings
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success message
      setShowSavedMessage(true);
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'appearance', name: 'Appearance' },
    { id: 'api', name: 'API Keys' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'billing', name: 'Billing' },
    { id: 'users', name: 'Users & Permissions' }
  ];

  return (
    <>
      <Head>
        <title>Settings | TowTrace</title>
        <meta name="description" content="TowTrace application settings" />
      </Head>

      <DashboardLayout title="Settings">
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-6">
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : user && hasRole('admin') ? (
          <div>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    `}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Success message */}
            {showSavedMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Settings saved successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab content */}
            <div className="bg-white shadow sm:rounded-lg">
              {/* General Settings Tab */}
              {activeTab === 'general' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Basic organization and application settings
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Company Name */}
                      <div className="sm:col-span-3">
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="companyName"
                            id="companyName"
                            value={generalSettings.companyName}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      {/* Contact Email */}
                      <div className="sm:col-span-3">
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                          Contact Email
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="contactEmail"
                            id="contactEmail"
                            value={generalSettings.contactEmail}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      {/* Contact Phone */}
                      <div className="sm:col-span-3">
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                          Contact Phone
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="contactPhone"
                            id="contactPhone"
                            value={generalSettings.contactPhone}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      {/* Timezone */}
                      <div className="sm:col-span-3">
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                          Timezone
                        </label>
                        <div className="mt-1">
                          <select
                            id="timezone"
                            name="timezone"
                            value={generalSettings.timezone}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                            <option value="America/Denver">Mountain Time (US & Canada)</option>
                            <option value="America/Chicago">Central Time (US & Canada)</option>
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Date Format */}
                      <div className="sm:col-span-3">
                        <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                          Date Format
                        </label>
                        <div className="mt-1">
                          <select
                            id="dateFormat"
                            name="dateFormat"
                            value={generalSettings.dateFormat}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Default Currency */}
                      <div className="sm:col-span-3">
                        <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                          Default Currency
                        </label>
                        <div className="mt-1">
                          <select
                            id="defaultCurrency"
                            name="defaultCurrency"
                            value={generalSettings.defaultCurrency}
                            onChange={handleGeneralChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Appearance Settings</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Customize the look and feel of the application
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="space-y-6">
                      {/* Dark Mode */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="darkMode"
                            name="darkMode"
                            type="checkbox"
                            checked={displaySettings.darkMode}
                            onChange={() => handleDisplayToggle('darkMode')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="darkMode" className="font-medium text-gray-700">Dark Mode</label>
                          <p className="text-gray-500">Use dark theme throughout the application</p>
                        </div>
                      </div>
                      
                      {/* High Contrast Mode */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="highContrastMode"
                            name="highContrastMode"
                            type="checkbox"
                            checked={displaySettings.highContrastMode}
                            onChange={() => handleDisplayToggle('highContrastMode')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="highContrastMode" className="font-medium text-gray-700">High Contrast Mode</label>
                          <p className="text-gray-500">Increase contrast for better visibility</p>
                        </div>
                      </div>
                      
                      {/* Large Text */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="largeText"
                            name="largeText"
                            type="checkbox"
                            checked={displaySettings.largeText}
                            onChange={() => handleDisplayToggle('largeText')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="largeText" className="font-medium text-gray-700">Large Text</label>
                          <p className="text-gray-500">Increase text size throughout the application</p>
                        </div>
                      </div>
                      
                      {/* Compact View */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="compactView"
                            name="compactView"
                            type="checkbox"
                            checked={displaySettings.compactView}
                            onChange={() => handleDisplayToggle('compactView')}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="compactView" className="font-medium text-gray-700">Compact View</label>
                          <p className="text-gray-500">Reduce spacing to show more content on screen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">API Keys</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage API keys for external integrations
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Your API Keys</h4>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Generate New Key
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Production Key</h5>
                            <span className="mt-1 text-xs text-gray-500">Created: Mar 15, 2023</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-500 mr-2">••••••••••••TYuk</span>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-500"
                              title="Show key"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-gray-500"
                              title="Copy to clipboard"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Test Key</h5>
                            <span className="mt-1 text-xs text-gray-500">Created: Feb 28, 2023</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-500 mr-2">••••••••••••WxPq</span>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-500"
                              title="Show key"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-gray-500"
                              title="Copy to clipboard"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">API Key Security Notice</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Protect your API keys and never share them publicly. Anyone with your API key can make
                              requests to the TowTrace API on your behalf. If you believe your key has been compromised,
                              regenerate a new key immediately.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Integrations</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Connect TowTrace with other services
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <ul className="divide-y divide-gray-200">
                      {/* QuickBooks Integration */}
                      <li className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">QB</span>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">QuickBooks</h4>
                            <p className="text-sm text-gray-500">Sync invoices and financial data</p>
                          </div>
                        </div>
                        <Link href="/dashboard/quickbooks">
                          <a className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Configure
                          </a>
                        </Link>
                      </li>
                      
                      {/* Google Maps Integration */}
                      <li className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 font-bold">GM</span>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">Google Maps</h4>
                            <p className="text-sm text-gray-500">Enable mapping and routing features</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Configure
                        </button>
                      </li>
                      
                      {/* Stripe Integration */}
                      <li className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">ST</span>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">Stripe</h4>
                            <p className="text-sm text-gray-500">Process payments and manage subscriptions</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Connect
                        </button>
                      </li>
                      
                      {/* Twilio Integration */}
                      <li className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 font-bold">TW</span>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">Twilio</h4>
                            <p className="text-sm text-gray-500">Send SMS notifications and alerts</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Connect
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Billing & Subscription</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage your TowTrace subscription
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Current Plan</h5>
                          <div className="mt-1 text-sm text-gray-500">Business Plus</div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900">$99.00</span>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <ul className="text-sm text-gray-500">
                          <li className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Unlimited vehicles
                          </li>
                          <li className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Up to 25 users
                          </li>
                          <li className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Premium support
                          </li>
                          <li className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            All integrations included
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Update
                      </button>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-200 rounded-md mb-4">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-900">Visa ending in 4242</h5>
                        <div className="mt-1 text-xs text-gray-500">Expires 12/2025</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Billing History</h4>
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr key="invoice-mar-2023">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Mar 01, 2023</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">TowTrace Business Plus</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$99.00</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button 
                                type="button"
                                onClick={() => alert('Invoice viewing will be available in a future update')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                          <tr key="invoice-feb-2023">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Feb 01, 2023</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">TowTrace Business Plus</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$99.00</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button 
                                type="button"
                                onClick={() => alert('Invoice viewing will be available in a future update')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Users & Permissions Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Users & Permissions</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage user accounts and access levels
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Invite User
                      </button>
                    </div>
                    
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">User</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100">
                                  <img src="https://i.pravatar.cc/150?u=admin@towtrace.com" alt="" className="h-8 w-8 rounded-full" />
                                </div>
                                <div className="ml-3">Admin User</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">admin@towtrace.com</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">admin</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href="#" className="text-blue-600 hover:text-blue-900">Edit</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100">
                                  <img src="https://i.pravatar.cc/150?u=dispatch@towtrace.com" alt="" className="h-8 w-8 rounded-full" />
                                </div>
                                <div className="ml-3">Dispatch Manager</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">dispatch@towtrace.com</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">dispatcher</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href="#" className="text-blue-600 hover:text-blue-900">Edit</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100">
                                  <img src="https://i.pravatar.cc/150?u=driver@towtrace.com" alt="" className="h-8 w-8 rounded-full" />
                                </div>
                                <div className="ml-3">Driver User</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">driver@towtrace.com</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">driver</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href="#" className="text-blue-600 hover:text-blue-900">Edit</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Role Permissions</h4>
                      
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">Feature</th>
                              <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                              <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatcher</th>
                              <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            <tr>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Jobs Management</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-blue-600">View Only</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Vehicle Management</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-blue-600">View Only</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Drivers Management</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-red-600">No Access</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">QuickBooks Integration</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-red-600">No Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-red-600">No Access</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">System Settings</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-green-600">Full Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-red-600">No Access</span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                <span className="text-red-600">No Access</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Save Settings Button (only for certain tabs) */}
            {(activeTab === 'general' || activeTab === 'appearance') && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving ? 'opacity-75 cursor-not-allowed' : ''
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
                  ) : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white shadow sm:rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need administrator privileges to access this page.
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Back to Dashboard
                </a>
              </Link>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}