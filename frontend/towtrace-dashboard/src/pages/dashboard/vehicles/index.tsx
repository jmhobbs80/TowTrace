import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { VehiclesAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Vehicles Dashboard
 * Displays a list of all vehicles with filtering and search capabilities
 */
export default function VehiclesDashboard() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(router.query.status || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await VehiclesAPI.getVehicles();
        setVehicles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Set user
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Apply status filter from URL if present
    if (router.query.status) {
      setFilterStatus(router.query.status);
    }

    fetchVehicles();
  }, [router.query.status]);

  // Filter vehicles by status and search term
  const filteredVehicles = vehicles.filter(vehicle => {
    // Status filter
    const statusMatch = filterStatus === 'all' || vehicle.status === filterStatus;
    
    // Search filter - check VIN, make, model, year
    const searchMatch = !searchTerm || (
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm)
    );
    
    return statusMatch && searchMatch;
  });

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: {
        ...(status === 'all' ? {} : { status }),
        ...(searchTerm ? { search: searchTerm } : {})
      }
    }, undefined, { shallow: true });
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Update URL with search query
    router.push({
      pathname: router.pathname,
      query: {
        ...(filterStatus === 'all' ? {} : { status: filterStatus }),
        ...(searchTerm ? { search: searchTerm } : {})
      }
    }, undefined, { shallow: true });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Vehicles | TowTrace</title>
        <meta name="description" content="Manage vehicle inventory" />
      </Head>

      <DashboardLayout title="Vehicles">
        {/* Action buttons and search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Filter buttons */}
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'active', 'pending', 'completed', 'inactive'].map((status) => (
                <button
                  key={status}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFilterChange(status)}
                >
                  {status === 'all' ? 'All Vehicles' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex">
              <input
                type="text"
                placeholder="Search VIN, make, model..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
            
            {/* Add Vehicle/Scan VIN buttons */}
            <div className="flex space-x-2">
              <Link href="/dashboard/vehicles/new">
                <a className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Vehicle
                </a>
              </Link>
              <Link href="/dashboard/vehicles/scan">
                <a className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scan VIN
                </a>
              </Link>
            </div>
          </div>
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
            <div className="animate-pulse space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredVehicles.length}</span> vehicle{filteredVehicles.length !== 1 ? 's' : ''}
                {filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}
                {searchTerm ? ` matching "${searchTerm}"` : ''}
              </p>
            </div>
            
            {/* Vehicles list */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {filteredVehicles.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <li key={vehicle.id}>
                      <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                        <a className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-blue-600">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    VIN: {vehicle.vin}
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? `No vehicles matching "${searchTerm}"` 
                      : filterStatus !== 'all'
                        ? `No vehicles with status "${filterStatus}"`
                        : 'Get started by adding a vehicle or scanning a VIN.'}
                  </p>
                  <div className="mt-6 flex justify-center space-x-4">
                    <Link href="/dashboard/vehicles/new">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Vehicle
                      </a>
                    </Link>
                    <Link href="/dashboard/vehicles/scan">
                      <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Scan VIN
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