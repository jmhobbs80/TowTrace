import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { QuickBooksAPI } from '../../../lib/api';

/**
 * QuickBooks Invoices Page
 * Displays a list of invoices synced with QuickBooks
 */
export default function QuickBooksInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(router.query.status || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock invoice data - in a real implementation, this would come from the API
        setInvoices([
          {
            id: 'INV-1001',
            jobId: '1001',
            customer: 'ABC Transport Inc.',
            date: new Date(Date.now() - 86400000).toISOString(),
            dueDate: new Date(Date.now() + 2592000000).toISOString(), // +30 days
            amount: 450.00,
            status: 'paid',
            paymentDate: new Date(Date.now() - 43200000).toISOString(), // -12 hours
          },
          {
            id: 'INV-1002',
            jobId: '1002',
            customer: 'XYZ Logistics',
            date: new Date(Date.now() - 172800000).toISOString(),
            dueDate: new Date(Date.now() + 2505600000).toISOString(), // +29 days
            amount: 325.50,
            status: 'pending',
            paymentDate: null,
          },
          {
            id: 'INV-1003',
            jobId: '1003',
            customer: 'Smith Auto Transport',
            date: new Date(Date.now() - 259200000).toISOString(),
            dueDate: new Date(Date.now() + 2419200000).toISOString(), // +28 days
            amount: 750.00,
            status: 'overdue',
            paymentDate: null,
          },
          {
            id: 'INV-1004',
            jobId: '1004',
            customer: 'Fast Lane Delivery',
            date: new Date(Date.now() - 345600000).toISOString(),
            dueDate: new Date(Date.now() + 2332800000).toISOString(), // +27 days
            amount: 550.75,
            status: 'paid',
            paymentDate: new Date(Date.now() - 172800000).toISOString(), // -2 days
          },
          {
            id: 'INV-1005',
            jobId: '1005',
            customer: 'City Motors Inc.',
            date: new Date(Date.now() - 432000000).toISOString(),
            dueDate: new Date(Date.now() + 2246400000).toISOString(), // +26 days
            amount: 425.25,
            status: 'pending',
            paymentDate: null,
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Apply status filter from URL if present
    if (router.query.status) {
      setFilterStatus(router.query.status);
    }

    fetchData();
  }, [router.query.status]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter invoices by status and search term
  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.jobId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: status === 'all' ? {} : { status }
    }, undefined, { shallow: true });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>QuickBooks Invoices | TowTrace</title>
        <meta name="description" content="View and manage QuickBooks invoices" />
      </Head>

      <DashboardLayout title="QuickBooks Invoices">
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

        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <label htmlFor="search" className="sr-only">Search invoices</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search invoices"
                  type="search"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              {['all', 'paid', 'pending', 'overdue'].map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFilterChange(status)}
                >
                  {status === 'all' ? 'All Invoices' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-t border-gray-200 py-4">
                  <div className="flex justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredInvoices.length}</span> invoice{filteredInvoices.length !== 1 ? 's' : ''}
                {filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}
                {searchTerm ? ` matching "${searchTerm}"` : ''}
              </p>
            </div>
            
            {/* Invoices list */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {filteredInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            <Link href={`/dashboard/quickbooks/invoices/${invoice.id}`}>
                              <a>{invoice.id}</a>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                type="button"
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => window.open(`https://quickbooks.intuit.com/app/invoices/${invoice.id}`, '_blank')}
                              >
                                View in QB
                              </button>
                              <Link href={`/dashboard/jobs/${invoice.jobId}`}>
                                <a className="text-blue-600 hover:text-blue-900">
                                  View Job
                                </a>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filterStatus !== 'all' 
                      ? `No invoices with status "${filterStatus}" found.` 
                      : searchTerm 
                        ? `No invoices matching "${searchTerm}" found.` 
                        : 'No invoices have been synced with QuickBooks yet.'}
                  </p>
                  <div className="mt-6">
                    <Link href="/dashboard/quickbooks">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync with QuickBooks
                      </a>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}