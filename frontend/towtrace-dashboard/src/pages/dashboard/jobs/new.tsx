import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { JobsAPI, DriversAPI, VehiclesAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Create New Job Page
 * Form to create a new transport job with:
 * - Job basic information (pickup, delivery)
 * - Vehicle selection/addition
 * - Driver assignment
 */
export default function CreateJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // Form state
  const [jobData, setJobData] = useState({
    from: '',
    to: '',
    driverId: '',
    notes: '',
  });

  // Initial load - get drivers, vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Check if user is authorized (admin or dispatcher)
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'dispatcher')) {
          router.push('/dashboard');
          return;
        }
        
        // Get drivers and vehicles
        const [driversResponse, vehiclesResponse] = await Promise.all([
          DriversAPI.getDrivers(),
          VehiclesAPI.getVehicles()
        ]);
        
        setDrivers(driversResponse.data);
        setVehicles(vehiclesResponse.data);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load drivers and vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle a vehicle selection
  const toggleVehicleSelection = (vehicle) => {
    if (selectedVehicles.some(v => v.id === vehicle.id)) {
      // Remove if already selected
      setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicle.id));
    } else {
      // Add if not selected
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!jobData.from || !jobData.to) {
      setError('Pick-up and delivery locations are required.');
      return;
    }
    
    if (selectedVehicles.length === 0) {
      setError('Please select at least one vehicle for transport.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create job with form data
      const payload = {
        ...jobData,
        vehicleIds: selectedVehicles.map(v => v.id),
        status: 'pending'
      };
      
      const response = await JobsAPI.createJob(payload);
      
      // Redirect to job details page
      router.push(`/dashboard/jobs/${response.data.id}`);
      
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create New Job | TowTrace</title>
        <meta name="description" content="Create a new transport job" />
      </Head>

      <DashboardLayout title="Create New Job">
        {/* Loading state */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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

            {/* Job Creation Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Job Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Enter the basic details for this transport job
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                    <div>
                      <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                        Pick-up Location <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="from"
                        id="from"
                        required
                        value={jobData.from}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Los Angeles, CA"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                        Delivery Location <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="to"
                        id="to"
                        required
                        value={jobData.to}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Phoenix, AZ"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
                        Assign Driver (Optional)
                      </label>
                      <select
                        id="driverId"
                        name="driverId"
                        value={jobData.driverId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                      <p className="mt-1 text-sm text-gray-500">You can also assign a driver later</p>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={jobData.notes}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Any special instructions or details..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Select Vehicles
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Select one or more vehicles for this transport job
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      Selected: {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''}
                    </span>
                    
                    {selectedVehicles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedVehicles.map(vehicle => (
                          <span 
                            key={vehicle.id} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {vehicle.year} {vehicle.make} {vehicle.model}
                            <button 
                              type="button"
                              onClick={() => toggleVehicleSelection(vehicle)}
                              className="ml-1.5 inline-flex text-blue-400 focus:outline-none"
                            >
                              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Vehicle selection grid */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.length > 0 ? (
                      vehicles
                        .filter(vehicle => vehicle.status !== 'inactive')
                        .map(vehicle => {
                          const isSelected = selectedVehicles.some(v => v.id === vehicle.id);
                          return (
                            <div
                              key={vehicle.id}
                              className={`relative rounded-lg border ${
                                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                              } px-4 py-4 shadow-sm transition-colors hover:border-gray-400 cursor-pointer`}
                              onClick={() => toggleVehicleSelection(vehicle)}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 h-5 w-5 text-blue-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                  VIN: {vehicle.vin}
                                </p>
                                <p className={`mt-2 text-xs ${
                                  vehicle.status === 'active' ? 'text-green-800' 
                                    : vehicle.status === 'pending' ? 'text-yellow-800' 
                                    : 'text-blue-800'
                                }`}>
                                  {vehicle.status.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="col-span-3 text-center py-4">
                        <p className="text-sm text-gray-500">No vehicles available. Please add vehicles first.</p>
                        <div className="mt-4">
                          <Link href="/dashboard/vehicles/new">
                            <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Add Vehicle
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link href="/dashboard/vehicles/scan">
                      <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Scan New VIN
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3">
                <Link href="/dashboard/jobs">
                  <a className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                  </a>
                </Link>
                <button
                  type="submit"
                  disabled={submitting || selectedVehicles.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}