import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { VehiclesAPI, JobsAPI, InspectionsAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Vehicle Detail Page
 * Shows detailed information about a specific vehicle including:
 * - Vehicle specifications and VIN details
 * - Inspection history
 * - Job history
 */
export default function VehicleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch vehicle data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Fetch vehicle details
        const vehicleResponse = await VehiclesAPI.getVehicle(id as string);
        setVehicle(vehicleResponse.data);
        
        // Fetch related data
        try {
          // Get inspection history - this might fail if no inspections yet
          const inspectionsResponse = await InspectionsAPI.getInspections({ vehicleId: id });
          setInspections(inspectionsResponse.data);
        } catch (err) {
          console.log('No inspections found for this vehicle');
          setInspections([]);
        }
        
        // Use mock job history data for now - in real app would fetch from API
        setJobHistory([
          {
            id: '1001',
            status: 'completed',
            from: 'Los Angeles, CA',
            to: 'Phoenix, AZ',
            driverName: 'Michael Thompson',
            createdAt: new Date(Date.now() - 1000000000).toISOString() // About 12 days ago
          },
          {
            id: '1003',
            status: 'active',
            from: 'Denver, CO',
            to: 'Salt Lake City, UT',
            driverName: 'David Wilson',
            createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Update vehicle status
  const handleUpdateStatus = async (newStatus) => {
    try {
      await VehiclesAPI.updateVehicle(id as string, { status: newStatus });
      
      // Update local vehicle data
      setVehicle({
        ...vehicle,
        status: newStatus
      });
      
    } catch (err) {
      console.error('Error updating vehicle status:', err);
      alert('Failed to update vehicle status. Please try again.');
    }
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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Head>
        <title>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle Details'} | TowTrace</title>
        <meta name="description" content="View vehicle details and history" />
      </Head>

      <DashboardLayout 
        title={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle Details'}
        hideTitle={loading}
      >
        {/* Loading state */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <Link href="/dashboard/vehicles">
                    <a className="text-sm text-red-700 underline">
                      Go back to vehicles list
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : vehicle ? (
          <div className="space-y-6">
            {/* Tabs navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {['info', 'inspections', 'jobs'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      className={`${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'info' ? 'Vehicle Info' : tab}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Vehicle Info Tab */}
            {activeTab === 'info' && (
              <>
                {/* Vehicle Information */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Vehicle Information
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        VIN: {vehicle.vin}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Make
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {vehicle.make}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Model
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {vehicle.model}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Year
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {vehicle.year}
                        </dd>
                      </div>
                      {vehicle.trim && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Trim
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {vehicle.trim}
                          </dd>
                        </div>
                      )}
                      {vehicle.engine && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Engine
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {vehicle.engine}
                          </dd>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Transmission
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {vehicle.transmission}
                          </dd>
                        </div>
                      )}
                      {vehicle.exteriorColor && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Exterior Color
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {vehicle.exteriorColor}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Actions Card */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Vehicle Actions
                    </h3>
                    <div className="mt-5">
                      {/* Status actions */}
                      <div>
                        <span className="text-sm font-medium text-gray-700">Update Status:</span>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {vehicle.status !== 'active' && (
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              onClick={() => handleUpdateStatus('active')}
                            >
                              Mark as Active
                            </button>
                          )}
                          
                          {vehicle.status !== 'pending' && (
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              onClick={() => handleUpdateStatus('pending')}
                            >
                              Mark as Pending
                            </button>
                          )}
                          
                          {vehicle.status !== 'completed' && (
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => handleUpdateStatus('completed')}
                            >
                              Mark as Completed
                            </button>
                          )}
                          
                          {vehicle.status !== 'inactive' && (
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => handleUpdateStatus('inactive')}
                            >
                              Mark as Inactive
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Other actions */}
                      <div className="pt-5 border-t border-gray-200 mt-5">
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/dashboard/inspections/new?vehicleId=${vehicle.id}`}>
                            <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Create Inspection
                            </a>
                          </Link>
                          
                          <Link href={`/dashboard/jobs/new?vehicleId=${vehicle.id}`}>
                            <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Add to New Job
                            </a>
                          </Link>
                          
                          <Link href="/dashboard/vehicles">
                            <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Back to Vehicles
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Inspections Tab */}
            {activeTab === 'inspections' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Inspection History
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Vehicle inspections for {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  {inspections.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {inspections.map((inspection) => (
                        <li key={inspection.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">
                                Inspection on {formatDate(inspection.date)}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {inspection.notes || 'No notes provided'}
                              </p>
                            </div>
                            <div>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                inspection.status === 'passed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {inspection.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <Link href={`/dashboard/inspections/${inspection.id}`}>
                              <a className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                View details
                              </a>
                            </Link>
                          </div>
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
                        Get started by creating a new inspection for this vehicle.
                      </p>
                      <div className="mt-6">
                        <Link href={`/dashboard/inspections/new?vehicleId=${vehicle.id}`}>
                          <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Create Inspection
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Job History
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Transport jobs for {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  {jobHistory.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {jobHistory.map((job) => (
                        <li key={job.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600">
                              Job #{job.id}
                            </p>
                            <div>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {job.from} to {job.to}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <p>
                                {formatDate(job.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <Link href={`/dashboard/jobs/${job.id}`}>
                              <a className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                View job details
                              </a>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This vehicle has not been used in any jobs yet.
                      </p>
                      <div className="mt-6">
                        <Link href={`/dashboard/jobs/new?vehicleId=${vehicle.id}`}>
                          <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create Job with this Vehicle
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No vehicle found with ID {id}</p>
            <div className="mt-6">
              <Link href="/dashboard/vehicles">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Go back to vehicles list
                </a>
              </Link>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}