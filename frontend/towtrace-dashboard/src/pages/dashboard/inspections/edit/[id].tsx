import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { InspectionsAPI, VehiclesAPI, DriversAPI } from '../../../../lib/api';

/**
 * Edit Inspection Form
 * Form to edit an existing vehicle inspection
 */
export default function EditInspection() {
  const router = useRouter();
  const { id } = router.query;
  
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    status: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch inspection details
        const inspectionResponse = await InspectionsAPI.getInspection(id as string);
        const inspectionData = inspectionResponse.data;
        
        // Set form data from inspection
        setFormData({
          vehicleId: inspectionData.vehicleId || '',
          driverId: inspectionData.driverId || '',
          status: inspectionData.status || 'pending',
          notes: inspectionData.notes || '',
        });
        
        // Fetch vehicles for dropdown
        const vehiclesResponse = await VehiclesAPI.getVehicles();
        setVehicles(vehiclesResponse.data);
        
        // Fetch drivers for dropdown
        const driversResponse = await DriversAPI.getDrivers();
        setDrivers(driversResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching inspection data:', err);
        setError('Failed to load inspection data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate form
      if (!formData.vehicleId) {
        setError('Please select a vehicle');
        setSubmitting(false);
        return;
      }
      
      if (!formData.driverId) {
        setError('Please select an inspector');
        setSubmitting(false);
        return;
      }
      
      // Submit to API (this would be an update call in a real API)
      // For now we'll use mock functionality in our InspectionsAPI
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect back to the inspection detail page
      router.push(`/dashboard/inspections/${id}`);
      
    } catch (err) {
      console.error('Error updating inspection:', err);
      setError('Failed to update inspection. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Inspection | TowTrace</title>
        <meta name="description" content="Edit vehicle inspection" />
      </Head>

      <DashboardLayout title={`Edit Inspection #${id}`}>
        {/* Back button */}
        <div className="mb-6">
          <Link href={`/dashboard/inspections/${id}`}>
            <a className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Inspection Details
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
              
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Vehicle Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
                      Vehicle *
                    </label>
                    <div className="mt-1">
                      <select
                        id="vehicleId"
                        name="vehicleId"
                        value={formData.vehicleId}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the vehicle that was inspected
                    </p>
                  </div>

                  {/* Inspector Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
                      Inspector *
                    </label>
                    <div className="mt-1">
                      <select
                        id="driverId"
                        name="driverId"
                        value={formData.driverId}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select an inspector</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the driver who performed the inspection
                    </p>
                  </div>

                  {/* Status Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Update the current inspection status
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter inspection notes here..."
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Update notes or observations about the vehicle condition
                    </p>
                  </div>

                  {/* Photos Section - For future implementation */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Photos
                    </label>
                    <div className="mt-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Photo upload functionality will be available in a future update
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inspection Checklist - For future implementation */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Inspection Checklist
                    </label>
                    <div className="mt-1">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-500 text-center py-4">
                          Detailed inspection checklist will be available in a future update
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
                <Link href={`/dashboard/inspections/${id}`}>
                  <a className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                  </a>
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    submitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Inspection'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}