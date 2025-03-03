import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { InspectionsAPI, VehiclesAPI, DriversAPI } from '../../../lib/api';

/**
 * Inspection Detail View
 * Displays detailed information about a specific vehicle inspection
 */
export default function InspectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [inspection, setInspection] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch inspection details
        const inspectionResponse = await InspectionsAPI.getInspection(id as string);
        const inspectionData = inspectionResponse.data;
        setInspection(inspectionData);
        
        // Fetch related vehicle details
        if (inspectionData.vehicleId) {
          const vehicleResponse = await VehiclesAPI.getVehicle(inspectionData.vehicleId);
          setVehicle(vehicleResponse.data);
        }
        
        // Fetch related driver details
        if (inspectionData.driverId) {
          const driverResponse = await DriversAPI.getDriver(inspectionData.driverId);
          setDriver(driverResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching inspection details:', err);
        setError('Failed to load inspection details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <title>{loading ? 'Loading Inspection...' : `Inspection #${id}`} | TowTrace</title>
        <meta name="description" content="Vehicle inspection details" />
      </Head>

      <DashboardLayout title={loading ? 'Loading Inspection...' : `Inspection #${id}`}>
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dashboard/inspections">
            <a className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Inspections
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
            {inspection && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Header with status badge */}
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Inspection Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Conducted on {formatDate(inspection.date)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(inspection.status)}`}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </span>
                </div>
                
                {/* Inspection details */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    {/* Vehicle Information */}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {vehicle ? (
                          <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                            <a className="text-blue-600 hover:text-blue-500">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </a>
                          </Link>
                        ) : (
                          <span>Unknown Vehicle</span>
                        )}
                      </dd>
                      {vehicle && (
                        <dd className="mt-1 text-sm text-gray-500">
                          VIN: {vehicle.vin}
                        </dd>
                      )}
                    </div>
                    
                    {/* Inspector/Driver Information */}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Inspector</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {driver ? (
                          <Link href={`/dashboard/drivers/${driver.id}`}>
                            <a className="text-blue-600 hover:text-blue-500">
                              {driver.name}
                            </a>
                          </Link>
                        ) : (
                          <span>Unknown Inspector</span>
                        )}
                      </dd>
                      {driver && (
                        <dd className="mt-1 text-sm text-gray-500">
                          {driver.email}
                        </dd>
                      )}
                    </div>
                    
                    {/* Inspection Date */}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Inspection Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(inspection.date)}</dd>
                    </div>
                    
                    {/* Inspection ID */}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Inspection ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{inspection.id}</dd>
                    </div>
                    
                    {/* Notes Section */}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {inspection.notes || 'No notes provided'}
                      </dd>
                    </div>
                    
                    {/* Photos Section - For future implementation */}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Photos</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">
                            No photos available for this inspection
                          </p>
                        </div>
                      </dd>
                    </div>
                    
                    {/* Inspection Checklist - For future implementation */}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Inspection Checklist</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-500 text-center py-4">
                            Detailed inspection checklist will be available in a future update
                          </p>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {/* Action buttons */}
                <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end space-x-3">
                  <button 
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export PDF
                  </button>
                  
                  <Link href={`/dashboard/inspections/edit/${id}`}>
                    <a className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Inspection
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
}