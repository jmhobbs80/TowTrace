'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function InspectionDetailsPage() {
  const params = useParams();
  const inspectionId = params.id;
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock inspection data based on ID
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // This would be an API call in a real application
      const mockInspections = {
        '1': {
          id: '1',
          vehicle: 'Tow Truck #103',
          vehicleId: 'TT-103',
          vin: '1HGCM82633A123456',
          driver: 'John Smith',
          date: '2025-03-01T08:30:00Z',
          status: 'passed',
          notes: 'All systems operational',
          odometer: 56789,
          location: 'Phoenix Terminal',
          duration: '25 minutes',
          fmcsaCompliant: true,
          items: [
            { name: 'Brakes', status: 'Passed', notes: 'Working properly' },
            { name: 'Tires', status: 'Passed', notes: 'Proper inflation: 35 PSI all around' },
            { name: 'Lights', status: 'Passed', notes: 'All functional' },
            { name: 'Fluid Levels', status: 'Passed', notes: 'Oil, coolant, washer fluid checked' },
            { name: 'Exhaust System', status: 'Passed', notes: 'No leaks' },
            { name: 'Horn', status: 'Passed', notes: 'Working properly' },
            { name: 'Windshield & Wipers', status: 'Passed', notes: 'No cracks, wipers functional' },
            { name: 'Emergency Equipment', status: 'Passed', notes: 'Fire extinguisher, reflectors present' },
            { name: 'Coupling Devices', status: 'Passed', notes: 'Properly secured' },
            { name: 'Cargo Securement', status: 'Passed', notes: 'All restraints functional' },
          ],
          images: [
            { id: 1, url: 'https://placehold.co/600x400?text=Front+View', caption: 'Front View' },
            { id: 2, url: 'https://placehold.co/600x400?text=Driver+Side', caption: 'Driver Side' },
          ]
        },
        '2': {
          id: '2',
          vehicle: 'Flatbed #205',
          vehicleId: 'FB-205',
          vin: '5FNRL38707B418521',
          driver: 'Sarah Johnson',
          date: '2025-02-28T09:15:00Z',
          status: 'passed',
          notes: 'Vehicle in excellent condition',
          odometer: 34567,
          location: 'Scottsdale Yard',
          duration: '30 minutes',
          fmcsaCompliant: true,
          items: [
            { name: 'Brakes', status: 'Passed', notes: 'Working properly' },
            { name: 'Tires', status: 'Passed', notes: 'Proper inflation: 40 PSI all around' },
            { name: 'Lights', status: 'Passed', notes: 'All functional' },
            { name: 'Fluid Levels', status: 'Passed', notes: 'All checked and topped off' },
            { name: 'Exhaust System', status: 'Passed', notes: 'No leaks' },
            { name: 'Horn', status: 'Passed', notes: 'Working properly' },
            { name: 'Windshield & Wipers', status: 'Passed', notes: 'Clear visibility' },
            { name: 'Emergency Equipment', status: 'Passed', notes: 'All present and functional' },
            { name: 'Coupling Devices', status: 'Passed', notes: 'Secure and operational' },
            { name: 'Cargo Securement', status: 'Passed', notes: 'Straps and chains in good condition' },
          ],
          images: [
            { id: 1, url: 'https://placehold.co/600x400?text=Front+View', caption: 'Front View' },
            { id: 2, url: 'https://placehold.co/600x400?text=Rear+View', caption: 'Rear View' },
            { id: 3, url: 'https://placehold.co/600x400?text=Loading+Ramp', caption: 'Loading Ramp' },
          ]
        },
        '3': {
          id: '3',
          vehicle: 'Tow Truck #107',
          vehicleId: 'TT-107',
          vin: 'JH4KA7650NC003125',
          driver: 'Michael Brown',
          date: '2025-02-27T14:45:00Z',
          status: 'failed',
          notes: 'Vehicle requires maintenance before next use',
          odometer: 78901,
          location: 'Tempe Depot',
          duration: '40 minutes',
          fmcsaCompliant: false,
          items: [
            { name: 'Brakes', status: 'Passed', notes: 'Working properly' },
            { name: 'Tires', status: 'Failed', notes: 'Low pressure in rear right tire (25 PSI)' },
            { name: 'Lights', status: 'Failed', notes: 'Brake light malfunction' },
            { name: 'Fluid Levels', status: 'Passed', notes: 'All checked and filled' },
            { name: 'Exhaust System', status: 'Passed', notes: 'No issues found' },
            { name: 'Horn', status: 'Passed', notes: 'Working properly' },
            { name: 'Windshield & Wipers', status: 'Passed', notes: 'Good condition' },
            { name: 'Emergency Equipment', status: 'Passed', notes: 'All present' },
            { name: 'Coupling Devices', status: 'Passed', notes: 'Properly secured' },
            { name: 'Cargo Securement', status: 'Passed', notes: 'All functional' },
          ],
          images: [
            { id: 1, url: 'https://placehold.co/600x400?text=Brake+Light+Issue', caption: 'Brake Light Issue' },
            { id: 2, url: 'https://placehold.co/600x400?text=Tire+Pressure+Problem', caption: 'Tire Pressure Problem' },
          ]
        },
        '4': {
          id: '4',
          vehicle: 'Wrecker #302',
          vehicleId: 'WR-302',
          vin: '1G1JC524427348888',
          driver: 'Jessica Davis',
          date: '2025-02-26T11:20:00Z',
          status: 'passed',
          notes: 'Vehicle ready for service',
          odometer: 45678,
          location: 'Mesa Terminal',
          duration: '28 minutes',
          fmcsaCompliant: true,
          items: [
            { name: 'Brakes', status: 'Passed', notes: 'Recently serviced' },
            { name: 'Tires', status: 'Passed', notes: 'Good tread, proper inflation' },
            { name: 'Lights', status: 'Passed', notes: 'All functional' },
            { name: 'Fluid Levels', status: 'Passed', notes: 'All checked' },
            { name: 'Exhaust System', status: 'Passed', notes: 'No issues' },
            { name: 'Horn', status: 'Passed', notes: 'Working properly' },
            { name: 'Windshield & Wipers', status: 'Passed', notes: 'Clear, wipers functional' },
            { name: 'Emergency Equipment', status: 'Passed', notes: 'All present' },
            { name: 'Coupling Devices', status: 'Passed', notes: 'Well maintained' },
            { name: 'Cargo Securement', status: 'Passed', notes: 'All straps intact' },
          ],
          images: [
            { id: 1, url: 'https://placehold.co/600x400?text=Vehicle+Overview', caption: 'Vehicle Overview' },
          ]
        },
        '5': {
          id: '5',
          vehicle: 'Flatbed #201',
          vehicleId: 'FB-201',
          vin: 'WBAXH5C53DD112233',
          driver: 'David Wilson',
          date: '2025-02-25T15:30:00Z',
          status: 'failed',
          notes: 'Multiple issues require immediate attention',
          odometer: 67890,
          location: 'Chandler Yard',
          duration: '35 minutes',
          fmcsaCompliant: false,
          items: [
            { name: 'Brakes', status: 'Passed', notes: 'Functioning properly' },
            { name: 'Tires', status: 'Passed', notes: 'Good condition' },
            { name: 'Lights', status: 'Passed', notes: 'All working' },
            { name: 'Fluid Levels', status: 'Passed', notes: 'All checked' },
            { name: 'Exhaust System', status: 'Passed', notes: 'No issues' },
            { name: 'Horn', status: 'Passed', notes: 'Working properly' },
            { name: 'Windshield & Wipers', status: 'Failed', notes: 'Large crack in windshield' },
            { name: 'Emergency Equipment', status: 'Failed', notes: 'Missing safety triangles' },
            { name: 'Coupling Devices', status: 'Passed', notes: 'Functioning properly' },
            { name: 'Cargo Securement', status: 'Passed', notes: 'All functional' },
          ],
          images: [
            { id: 1, url: 'https://placehold.co/600x400?text=Windshield+Crack', caption: 'Windshield Crack' },
            { id: 2, url: 'https://placehold.co/600x400?text=Missing+Equipment', caption: 'Missing Safety Equipment' },
          ]
        },
      };

      setInspection(mockInspections[inspectionId] || null);
      setLoading(false);
    }, 500);
  }, [inspectionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Inspection Not Found</h2>
        <p className="mt-2 text-gray-600">The inspection report you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/inspections" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
          &larr; Back to Inspections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/inspections" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Inspections
        </Link>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print
          </button>
          <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Export as PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Inspection Report #{inspection.id}
            </h1>
            <div className="mt-2 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                inspection.status === 'passed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {inspection.status === 'passed' ? 'PASSED' : 'FAILED'}
              </span>
              {inspection.fmcsaCompliant && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  FMCSA Compliant
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium">{inspection.vehicle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle ID</p>
                  <p className="font-medium">{inspection.vehicleId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">VIN</p>
                  <p className="font-mono">{inspection.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Odometer</p>
                  <p className="font-medium">{inspection.odometer.toLocaleString()} miles</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Inspection Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{new Date(inspection.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Inspector</p>
                  <p className="font-medium">{inspection.driver}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{inspection.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{inspection.duration}</p>
                </div>
              </div>
            </div>
          </div>

          {inspection.notes && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Inspector Notes</h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-gray-700">{inspection.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inspection Items</h2>
        </div>
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspection.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.status === 'Passed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {inspection.images && inspection.images.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Inspection Photos</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inspection.images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg border border-gray-200">
                  <img 
                    src={image.url} 
                    alt={image.caption} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-gray-50 text-sm text-center text-gray-700">
                    {image.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">FMCSA Compliance Information</h2>
        </div>
        <div className="px-6 py-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This inspection report was conducted in accordance with Federal Motor Carrier Safety Administration (FMCSA) regulations for commercial motor vehicles. {!inspection.fmcsaCompliant && 'Deficiencies must be addressed before vehicle operation.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">FMCSA Regulation References:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>49 CFR § 396.11 - Driver vehicle inspection report(s)</li>
              <li>49 CFR § 396.13 - Driver inspection</li>
              <li>49 CFR § 396.3 - Inspection, repair, and maintenance</li>
              <li>49 CFR § 393 - Parts and accessories necessary for safe operation</li>
            </ul>
          </div>
          
          {!inspection.fmcsaCompliant && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    This vehicle fails to meet FMCSA requirements. All defects must be repaired before this vehicle can be legally operated on public roads.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Report generated on {new Date().toLocaleString()}
        </div>
        <Link href="/dashboard/inspections" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Back to Inspections
        </Link>
      </div>
    </div>
  );
}