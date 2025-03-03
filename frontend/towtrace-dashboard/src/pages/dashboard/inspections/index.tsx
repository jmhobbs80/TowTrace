import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { InspectionsAPI, VehiclesAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Inspections Dashboard
 * Displays a list of all vehicle inspections with filtering capabilities
 */
export default function InspectionsDashboard() {
  const router = useRouter();
  const [inspections, setInspections] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(router.query.status || 'all');
  const [user, setUser] = useState(null);

  // Fetch inspections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Fetch inspections
        const inspectionsResponse = await InspectionsAPI.getInspections();
        setInspections(inspectionsResponse.data);
        
        // Fetch vehicles to get details
        const vehiclesResponse = await VehiclesAPI.getVehicles();
        const vehiclesMap = {};
        vehiclesResponse.data.forEach(vehicle => {
          vehiclesMap[vehicle.id] = vehicle;
        });
        setVehicles(vehiclesMap);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching inspections:', err);
        setError('Failed to load inspections. Please try again.');
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

  // Filter inspections by status
  const filteredInspections = inspections.filter(inspection => {
    if (filterStatus === 'all') return true;
    return inspection.status === filterStatus;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId) => {
    const vehicle = vehicles[vehicleId];
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    
    // Update URL query params
    router.push({
      pathname: router.pathname,
      query: status === 'all' ? {} : { status }
    }, undefined, { shallow: true });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Inspections | TowTrace</title>
        <meta name="description" content="Manage vehicle inspections" />
      </Head>

      <DashboardLayout title="Inspections">
        {/* Action buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex space-x-2">
            {['all', 'passed', 'failed', 'pending'].map((status) => (
              <button
                key={status}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleFilterChange(status)}
              >
                {status === 'all' ? 'All Inspections' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <Link href="/dashboard/inspections/new">
            <a className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Inspection
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
                Showing <span className="font-medium">{filteredInspections.length}</span> inspection{filteredInspections.length !== 1 ? 's' : ''}
                {filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}
              </p>
            </div>
            
            {/* Inspections list */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {filteredInspections.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {filteredInspections.map((inspection) => (
                    <li key={inspection.id}>
                      <Link href={`/dashboard/inspections/${inspection.id}`}>
                        <a className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-blue-600">
                                    Inspection #{inspection.id}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Vehicle: {getVehicleDetails(inspection.vehicleId)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(inspection.date)}
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(inspection.status)}`}>
                                  {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                                </p>
                              </div>
                            </div>
                            
                            {inspection.notes && (
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {inspection.notes.length > 100 
                                      ? `${inspection.notes.substring(0, 100)}...` 
                                      : inspection.notes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No inspections found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filterStatus !== 'all' 
                      ? `No inspections with status "${filterStatus}" found.` 
                      : 'Get started by creating a new inspection.'}
                  </p>
                  <div className="mt-6">
                    <Link href="/dashboard/inspections/new">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Inspection
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