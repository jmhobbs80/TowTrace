import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { QuickBooksAPI, JobsAPI } from '../../../lib/api';

/**
 * QuickBooks Integration Dashboard
 * Displays QuickBooks connection status and options for syncing data and generating invoices
 */
export default function QuickBooksDashboard() {
  const router = useRouter();
  const [connection, setConnection] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [generateInvoiceId, setGenerateInvoiceId] = useState(null);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get QuickBooks connection status
        const connectionResponse = await QuickBooksAPI.getConnectionStatus();
        setConnection(connectionResponse.data);
        
        // Get recent jobs for invoice generation
        const jobsResponse = await JobsAPI.getJobs({
          limit: 10,
          status: 'completed',
          sort: 'createdAt:desc'
        });
        setRecentJobs(jobsResponse.data);
        
        // Mock sync history - in a real implementation, this would come from the API
        setSyncHistory([
          {
            id: 'sync-1',
            date: new Date(Date.now() - 86400000).toISOString(),
            items: { invoices: 24, customers: 18, items: 35 },
            initiatedBy: 'John Doe'
          },
          {
            id: 'sync-2',
            date: new Date(Date.now() - 172800000).toISOString(),
            items: { invoices: 20, customers: 15, items: 30 },
            initiatedBy: 'Jane Smith'
          },
          {
            id: 'sync-3',
            date: new Date(Date.now() - 259200000).toISOString(),
            items: { invoices: 18, customers: 12, items: 25 },
            initiatedBy: 'System'
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching QuickBooks data:', err);
        setError('Failed to load QuickBooks integration data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle sync with QuickBooks
  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await QuickBooksAPI.syncWithQuickBooks();
      
      // Update connection status with new sync time
      setConnection(prevState => ({
        ...prevState,
        lastSync: response.data.syncedAt
      }));
      
      // Add new sync to history
      setSyncHistory(prevState => [
        {
          id: `sync-${Date.now()}`,
          date: response.data.syncedAt,
          items: response.data.syncedItems,
          initiatedBy: 'Current User'
        },
        ...prevState
      ]);
      
    } catch (err) {
      console.error('Error syncing with QuickBooks:', err);
      setError('Failed to sync with QuickBooks. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Handle generate invoice for a job
  const handleGenerateInvoice = async (jobId) => {
    try {
      setGenerateInvoiceId(jobId);
      setError(null);
      setInvoiceResult(null);
      
      const response = await QuickBooksAPI.generateInvoice(jobId);
      setInvoiceResult(response.data);
      
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError('Failed to generate invoice. Please try again.');
    } finally {
      setGenerateInvoiceId(null);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Head>
        <title>QuickBooks Integration | TowTrace</title>
        <meta name="description" content="TowTrace QuickBooks Integration" />
      </Head>

      <DashboardLayout title="QuickBooks Integration">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                </div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Connection Status */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">QuickBooks Connection Status</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Details about your QuickBooks Online integration
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${connection?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {connection?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{connection?.companyName || 'Not available'}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Last Synchronized</dt>
                    <dd className="mt-1 text-sm text-gray-900">{connection?.lastSync ? formatDate(connection.lastSync) : 'Never'}</dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Actions</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="space-x-3">
                        <button
                          type="button"
                          onClick={handleSync}
                          disabled={syncing || !connection?.connected}
                          className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            (syncing || !connection?.connected) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {syncing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Sync with QuickBooks
                            </>
                          )}
                        </button>
                        
                        {!connection?.connected && (
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Connect QuickBooks
                          </button>
                        )}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Recently Generated Invoice */}
            {invoiceResult && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Generated Successfully</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    The invoice has been created in QuickBooks
                  </p>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Invoice ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{invoiceResult.invoiceId}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatCurrency(invoiceResult.amount)}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(invoiceResult.createdAt)}</dd>
                    </div>
                    
                    <div className="sm:col-span-3 mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setInvoiceResult(null)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Dismiss
                      </button>
                      
                      <a
                        href="https://qbo.intuit.com/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View in QuickBooks
                      </a>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            {connection?.connected && (
              <>
                {/* Generate Invoices */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Generate Invoices</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Create invoices in QuickBooks for completed jobs
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    {recentJobs.length > 0 ? (
                      <ul role="list" className="divide-y divide-gray-200">
                        {recentJobs.map((job) => (
                          <li key={job.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <svg className="h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-blue-600">
                                    Job #{job.id}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {job.from} to {job.to}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {job.vehicleCount} vehicle{job.vehicleCount !== 1 ? 's' : ''} • Driver: {job.driverName}
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <button
                                  type="button"
                                  onClick={() => handleGenerateInvoice(job.id)}
                                  disabled={generateInvoiceId === job.id}
                                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    generateInvoiceId === job.id ? 'opacity-75 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {generateInvoiceId === job.id ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                      </svg>
                                      Generate Invoice
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          There are no completed jobs available for invoice generation.
                        </p>
                        <div className="mt-6">
                          <Link href="/dashboard/jobs">
                            <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Jobs
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sync History */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Sync History</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Recent synchronization activities with QuickBooks
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    {syncHistory.length > 0 ? (
                      <ul role="list" className="divide-y divide-gray-200">
                        {syncHistory.map((sync) => (
                          <li key={sync.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Sync {formatDate(sync.date)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Initiated by: {sync.initiatedBy}
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-500">
                                    {sync.items.invoices} invoices
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {sync.items.customers} customers
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {sync.items.items} items
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sync history</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          There is no synchronization history with QuickBooks yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
}