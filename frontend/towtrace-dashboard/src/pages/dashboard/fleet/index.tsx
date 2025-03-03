import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { JobsAPI, DriversAPI, VehiclesAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * Fleet Tracker Dashboard
 * Real-time tracking of vehicles and jobs on a map
 * Displays vehicle locations, driver status, and job routes
 */
export default function FleetTrackerDashboard() {
  const router = useRouter();
  const { job: jobId } = router.query;
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Mock location data - in real app this would come from a real-time API
  const mockLocations = {
    'driver-1': { lat: 34.0522, lng: -118.2437, heading: 45 }, // Los Angeles
    'driver-2': { lat: 37.7749, lng: -122.4194, heading: 90 }, // San Francisco
    'driver-3': { lat: 39.7392, lng: -104.9903, heading: 180 }, // Denver
    'driver-4': { lat: 32.7157, lng: -117.1611, heading: 270 }, // San Diego
    'driver-5': { lat: 36.1699, lng: -115.1398, heading: 120 }, // Las Vegas
  };

  // Fetch data on component mount
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
        
        // Fetch drivers, vehicles, and active jobs
        const [driversResponse, vehiclesResponse, jobsResponse] = await Promise.all([
          DriversAPI.getDrivers(),
          VehiclesAPI.getVehicles(),
          JobsAPI.getJobs({ status: 'active' })
        ]);
        
        setDrivers(driversResponse.data);
        setVehicles(vehiclesResponse.data);
        setActiveJobs(jobsResponse.data);
        
        // If a job ID is provided in URL, set it as selected
        if (jobId) {
          const job = jobsResponse.data.find(j => j.id === jobId);
          if (job) {
            setSelectedJob(job);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching fleet data:', err);
        setError('Failed to load fleet data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router, jobId]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!loading && !error && mapRef.current && !mapLoaded) {
      // Simulation of map initialization - in a real app, this would use Google Maps or Mapbox
      console.log('Initializing map...');
      setMapLoaded(true);
      
      // Mock map setup code - in real app, this would be actual map initialization
      // This is a placeholder to show the concept without implementing actual mapping
      // The UI will simulate a map interface
    }
  }, [loading, error, mapLoaded]);

  // Get driver name by ID
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unassigned';
  };

  // Get driver status badge styling
  const getDriverStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'on_job':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter active drivers/vehicles if showActiveOnly is true
  const filteredDrivers = showActiveOnly 
    ? drivers.filter(d => d.status === 'active' || d.status === 'on_job')
    : drivers;

  // Get mock location for a driver
  const getDriverLocation = (driverId) => {
    return mockLocations[driverId] || { lat: 0, lng: 0, heading: 0 };
  };

  return (
    <>
      <Head>
        <title>Fleet Tracker | TowTrace</title>
        <meta name="description" content="Real-time fleet tracking and management" />
      </Head>

      <DashboardLayout 
        title="Fleet Tracker" 
        fullWidth={true}
      >
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row">
          {/* Sidebar - Drivers/Jobs List */}
          <div className="w-full lg:w-80 bg-white shadow-md lg:h-full overflow-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="text-lg font-medium text-gray-900">Fleet Status</div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showActiveOnly}
                    onChange={() => setShowActiveOnly(!showActiveOnly)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Active Only
                  </span>
                </label>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="m-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
            
            {/* Drivers list tab */}
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Drivers ({filteredDrivers.length})</h3>
            </div>
            
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-3 space-y-1 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {filteredDrivers.map(driver => (
                    <li key={driver.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={driver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} 
                            alt="" 
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                            <p className="text-xs text-gray-500">
                              {mockLocations[driver.id] ? 'Last updated: just now' : 'No location data'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDriverStatusBadge(driver.status)}`}>
                            {driver.status === 'on_job' ? 'On Job' : driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Active Jobs tab */}
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Active Jobs ({activeJobs.length})</h3>
            </div>
            
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {activeJobs.map(job => (
                    <li 
                      key={job.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedJob?.id === job.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <p className="text-sm font-medium text-blue-600">Job #{job.id}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {job.from} to {job.to}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Driver: {getDriverName(job.driverId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Vehicle{job.vehicleCount > 1 ? 's' : ''}: {job.vehicleCount}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Map container */}
          <div ref={mapRef} className="flex-1 bg-gray-100 relative">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-700">Loading map...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Simulation of a map - in real app this would be a real map component */}
                <div className="h-full p-6 flex flex-col items-center justify-center bg-blue-50">
                  <div className="text-center mb-4">
                    <div className="inline-block p-4 rounded-full bg-white shadow-md mb-4">
                      <svg className="h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Fleet Tracker Map</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md">
                      In the production application, this would be an interactive map showing real-time 
                      locations of all drivers and vehicles in your fleet.
                    </p>
                    
                    {selectedJob && (
                      <div className="mt-6 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
                        <h4 className="font-medium">Selected Job: #{selectedJob.id}</h4>
                        <p className="text-sm mt-2">Route: {selectedJob.from} to {selectedJob.to}</p>
                        <p className="text-sm">Driver: {getDriverName(selectedJob.driverId)}</p>
                        <div className="mt-4">
                          <Link href={`/dashboard/jobs/${selectedJob.id}`}>
                            <a className="text-sm text-blue-600 hover:text-blue-800">
                              View full job details →
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Driver positions simulation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {filteredDrivers
                      .filter(driver => mockLocations[driver.id])
                      .map(driver => {
                        const location = getDriverLocation(driver.id);
                        return (
                          <div key={driver.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={driver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} 
                                  alt="" 
                                />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                                <p className="text-xs text-gray-500">
                                  {driver.status === 'on_job' ? 'On Job' : driver.status}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-700">
                              <p>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
                              <p>Heading: {location.heading}°</p>
                              <p>Speed: 55 mph</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}