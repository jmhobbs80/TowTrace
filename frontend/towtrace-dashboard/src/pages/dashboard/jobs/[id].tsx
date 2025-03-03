import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { JobsAPI, DriversAPI } from '../../../lib/api';
import { getCurrentUser, User, hasRole } from '../../../lib/auth';

/**
 * Job Detail Page
 * Shows detailed information about a specific job including:
 * - Job status and basic information
 * - Vehicle details for the job
 * - Driver assignment
 * - Job history/timeline
 * - Actions like update status, assign driver, etc.
 */
export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  // Fetch job data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Get job details
        const jobResponse = await JobsAPI.getJob(id as string);
        setJob(jobResponse.data);
        
        // Get available drivers (if admin or dispatcher)
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'dispatcher')) {
          const driversResponse = await DriversAPI.getDrivers();
          setDrivers(driversResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle driver assignment
  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    
    try {
      setAssigning(true);
      await JobsAPI.assignDriver(id as string, selectedDriver);
      
      // Update local job data with new driver info
      const driver = drivers.find(d => d.id === selectedDriver);
      setJob({
        ...job,
        driverId: selectedDriver,
        driverName: driver.name
      });
      
      // Close modal
      setShowAssignModal(false);
      setSelectedDriver('');
    } catch (err) {
      console.error('Error assigning driver:', err);
      alert('Failed to assign driver. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle updating job status
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdateStatusLoading(true);
      await JobsAPI.updateJob(id as string, { status: newStatus });
      
      // Update local job data
      setJob({
        ...job,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Failed to update job status. Please try again.');
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
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

  // Driver assignment modal
  const AssignDriverModal = () => (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Assign Driver to Job #{id}
              </h3>
              <div className="mt-4">
                <select
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  <option value="">Select a driver</option>
                  {drivers
                    .filter(driver => driver.status === 'active')
                    .map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
              onClick={handleAssignDriver}
              disabled={!selectedDriver || assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Driver'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <Head>
        <title>{job ? `Job #${job.id}` : 'Job Details'} | TowTrace</title>
        <meta name="description" content="View and manage job details" />
      </Head>

      <DashboardLayout 
        title={job ? `Job #${job.id}` : 'Job Details'}
        hideTitle={loading} 
      >
        {/* Assign driver modal */}
        {showAssignModal && <AssignDriverModal />}

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
                  {[1, 2, 3, 4].map(i => (
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
                  <Link href="/dashboard/jobs">
                    <a className="text-sm text-red-700 underline">
                      Go back to jobs list
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : job ? (
          <div className="space-y-6">
            {/* Job Overview Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Job Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Details about this transport job
                  </p>
                </div>
                <div className="flex space-x-3">
                  {/* Status pill */}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Pick-up Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {job.from}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Delivery Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {job.to}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Driver
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center justify-between">
                      <div>
                        {job.driverName ? (
                          <>
                            <span>{job.driverName}</span>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Assigned
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </div>
                      
                      {/* Driver assignment button - only for admin and dispatcher */}
                      {user && (user.role === 'admin' || user.role === 'dispatcher') && (
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => setShowAssignModal(true)}
                        >
                          {job.driverName ? 'Reassign' : 'Assign Driver'}
                        </button>
                      )}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(job.createdAt)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Vehicle Count
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {job.vehicleCount} {job.vehicleCount === 1 ? 'vehicle' : 'vehicles'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Vehicles List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vehicles
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Vehicles included in this transport job
                </p>
              </div>
              <div className="border-t border-gray-200">
                {job.vehicles && job.vehicles.length > 0 ? (
                  <ul role="list" className="divide-y divide-gray-200">
                    {job.vehicles.map((vehicle) => (
                      <li key={vehicle.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                VIN: {vehicle.vin}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                              <a className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                View Details
                              </a>
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No vehicles found for this job.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Job Actions
                </h3>
                <div className="mt-5 space-y-4">
                  {/* Status updates - based on current status */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Update Status:</span>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {job.status !== 'active' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => handleUpdateStatus('active')}
                          disabled={updateStatusLoading}
                        >
                          Mark as Active
                        </button>
                      )}
                      
                      {job.status !== 'pending' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          onClick={() => handleUpdateStatus('pending')}
                          disabled={updateStatusLoading}
                        >
                          Mark as Pending
                        </button>
                      )}
                      
                      {job.status !== 'completed' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleUpdateStatus('completed')}
                          disabled={updateStatusLoading}
                        >
                          Mark as Completed
                        </button>
                      )}
                      
                      {job.status !== 'cancelled' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleUpdateStatus('cancelled')}
                          disabled={updateStatusLoading}
                        >
                          Cancel Job
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* More actions */}
                  <div className="pt-5 border-t border-gray-200 mt-5">
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/dashboard/fleet?job=${job.id}`}>
                        <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Track on Map
                        </a>
                      </Link>
                      
                      {/* QuickBooks invoice generation - admin only */}
                      {user?.role === 'admin' && (
                        <Link href={`/dashboard/quickbooks/invoice?jobId=${job.id}`}>
                          <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Generate Invoice
                          </a>
                        </Link>
                      )}
                      
                      <Link href={`/dashboard/jobs`}>
                        <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Back to Jobs
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No job found with ID {id}</p>
            <div className="mt-6">
              <Link href="/dashboard/jobs">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Go back to jobs list
                </a>
              </Link>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}