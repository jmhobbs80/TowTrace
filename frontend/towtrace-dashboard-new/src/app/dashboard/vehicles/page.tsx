'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VehiclesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [driverOptions, setDriverOptions] = useState([
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
    { id: 5, name: 'James Wilson' },
  ]);
  
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };
  
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle({...vehicle});
    setIsEditModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
  };
  
  const handleUpdateVehicle = (updatedVehicle) => {
    // In a real app, this would make an API call to update the vehicle
    // For this demo, we'll just close the modal and show a success message
    console.log('Vehicle updated:', updatedVehicle);
    setIsEditModalOpen(false);
    alert('Vehicle updated successfully!');
  };
  
  // Sample vehicles data with extended information
  const vehicles = [
    { 
      id: 1, 
      vin: "1HGCM82633A123456", 
      make: "Honda", 
      model: "Accord", 
      year: 2020, 
      status: "Active", 
      driver: "John Smith", 
      driverId: 1,
      lastUpdated: "2 hours ago",
      currentLoad: {
        id: 101,
        vehicles: [
          { make: "Toyota", model: "Camry", year: 2019, vin: "4T1BF1FK5HU123456" },
          { make: "Honda", model: "Civic", year: 2020, vin: "19XFC2F53NE789012" }
        ],
        pickupLocation: "Phoenix, AZ",
        dropoffLocation: "Tucson, AZ",
        status: "In Transit",
        progress: 65
      },
      inspections: [
        { 
          id: 1001, 
          date: "2025-03-01T08:30:00Z", 
          inspector: "John Smith",
          status: "Passed",
          notes: "All systems operational",
          items: [
            { name: "Brakes", status: "Good", notes: "Recently serviced" },
            { name: "Tires", status: "Good", notes: "Pressure: 35 PSI all around" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Fluids", status: "Good", notes: "Oil changed" }
          ]
        },
        { 
          id: 1002, 
          date: "2025-02-15T09:15:00Z", 
          inspector: "John Smith",
          status: "Passed",
          notes: "Minor issues resolved",
          items: [
            { name: "Brakes", status: "Good", notes: "Functioning properly" },
            { name: "Tires", status: "Fair", notes: "Rear right tire showing wear" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Fluids", status: "Good", notes: "All levels normal" }
          ]
        }
      ],
      eldLogs: [
        { date: "2025-03-03", driving: 7.5, onDuty: 2, offDuty: 14.5, status: "Compliant" },
        { date: "2025-03-02", driving: 8, onDuty: 2.5, offDuty: 13.5, status: "Compliant" },
        { date: "2025-03-01", driving: 6, onDuty: 3, offDuty: 15, status: "Compliant" }
      ]
    },
    { 
      id: 2, 
      vin: "5FNRL38707B418521", 
      make: "Toyota", 
      model: "Camry", 
      year: 2019, 
      status: "In Service", 
      driver: "Unassigned", 
      driverId: null,
      lastUpdated: "1 day ago",
      currentLoad: null,
      inspections: [
        { 
          id: 1003, 
          date: "2025-02-28T10:00:00Z", 
          inspector: "Maintenance Staff",
          status: "In Progress",
          notes: "In shop for regular maintenance",
          items: [
            { name: "Brakes", status: "Check", notes: "Scheduled for replacement" },
            { name: "Tires", status: "Good", notes: "Pressure normal" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Fluids", status: "Check", notes: "Oil change in progress" }
          ]
        }
      ],
      eldLogs: []
    },
    { 
      id: 3, 
      vin: "JH4KA7650NC003125", 
      make: "Ford", 
      model: "F-150", 
      year: 2021, 
      status: "Available", 
      driver: "Unassigned", 
      driverId: null,
      lastUpdated: "5 hours ago",
      currentLoad: null,
      inspections: [
        { 
          id: 1004, 
          date: "2025-03-02T14:30:00Z", 
          inspector: "Maintenance Staff",
          status: "Passed",
          notes: "Ready for service",
          items: [
            { name: "Brakes", status: "Good", notes: "Functioning properly" },
            { name: "Tires", status: "Good", notes: "All new tires installed" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Fluids", status: "Good", notes: "All levels checked and filled" }
          ]
        }
      ],
      eldLogs: []
    },
    { 
      id: 4, 
      vin: "1G1JC524427348888", 
      make: "Chevrolet", 
      model: "Malibu", 
      year: 2022, 
      status: "Active", 
      driver: "Sarah Johnson", 
      driverId: 2,
      lastUpdated: "30 minutes ago",
      currentLoad: {
        id: 102,
        vehicles: [
          { make: "Nissan", model: "Altima", year: 2021, vin: "1N4BL4EV5XC345678" },
          { make: "Ford", model: "Focus", year: 2018, vin: "1FADP3K29JL901234" },
          { make: "Chevrolet", model: "Malibu", year: 2017, vin: "1G1ZE5SX9HF123456" }
        ],
        pickupLocation: "Scottsdale, AZ",
        dropoffLocation: "Flagstaff, AZ",
        status: "In Transit",
        progress: 30
      },
      inspections: [
        { 
          id: 1005, 
          date: "2025-03-03T07:15:00Z", 
          inspector: "Sarah Johnson",
          status: "Passed",
          notes: "All systems operational",
          items: [
            { name: "Brakes", status: "Good", notes: "Functioning properly" },
            { name: "Tires", status: "Good", notes: "Pressure: 36 PSI all around" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Fluids", status: "Good", notes: "All levels normal" }
          ]
        }
      ],
      eldLogs: [
        { date: "2025-03-03", driving: 4.5, onDuty: 1.5, offDuty: 18, status: "Compliant" },
        { date: "2025-03-02", driving: 7, onDuty: 2, offDuty: 15, status: "Compliant" },
        { date: "2025-03-01", driving: 8, onDuty: 2, offDuty: 14, status: "Compliant" }
      ]
    },
    { 
      id: 5, 
      vin: "WBAXH5C53DD112233", 
      make: "BMW", 
      model: "X5", 
      year: 2018, 
      status: "Maintenance", 
      driver: "Unassigned", 
      driverId: null,
      lastUpdated: "3 days ago",
      currentLoad: null,
      inspections: [
        { 
          id: 1006, 
          date: "2025-02-28T11:30:00Z", 
          inspector: "Maintenance Staff",
          status: "Failed",
          notes: "Transmission issues detected",
          items: [
            { name: "Brakes", status: "Good", notes: "Functioning properly" },
            { name: "Tires", status: "Good", notes: "Pressure normal" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Transmission", status: "Critical", notes: "Requires replacement" }
          ]
        }
      ],
      eldLogs: []
    },
    { 
      id: 6, 
      vin: "5YJSA1E11GF176145", 
      make: "Tesla", 
      model: "Model S", 
      year: 2023, 
      status: "Active", 
      driver: "Michael Brown", 
      driverId: 3,
      lastUpdated: "1 hour ago",
      currentLoad: {
        id: 103,
        vehicles: [
          { make: "Tesla", model: "Model 3", year: 2022, vin: "5YJ3E1EA8NF876543" }
        ],
        pickupLocation: "Tempe, AZ",
        dropoffLocation: "Phoenix, AZ",
        status: "In Transit",
        progress: 85
      },
      inspections: [
        { 
          id: 1007, 
          date: "2025-03-03T06:45:00Z", 
          inspector: "Michael Brown",
          status: "Passed",
          notes: "All systems operational",
          items: [
            { name: "Brakes", status: "Good", notes: "Regenerative braking optimal" },
            { name: "Tires", status: "Good", notes: "Pressure: 42 PSI all around" },
            { name: "Lights", status: "Good", notes: "All functional" },
            { name: "Battery", status: "Good", notes: "98% capacity" }
          ]
        }
      ],
      eldLogs: [
        { date: "2025-03-03", driving: 3, onDuty: 1, offDuty: 20, status: "Compliant" },
        { date: "2025-03-02", driving: 6.5, onDuty: 1.5, offDuty: 16, status: "Compliant" },
        { date: "2025-03-01", driving: 7, onDuty: 2, offDuty: 15, status: "Compliant" }
      ]
    },
  ];
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Truck Management</h1>
          <p className="text-gray-600">Track and manage your fleet</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/vehicles/scan" className="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
            </svg>
            Scan VIN
          </Link>
          <Link href="/dashboard/vehicles/new" className="btn btn-secondary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Vehicle
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Trucks</h2>
          <div className="flex items-center">
            <div className="mr-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search vehicles..." 
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>
            <select className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">VIN</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Make/Model</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Year</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Assigned Driver</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{vehicle.id}</td>
                  <td className="py-3 px-4 font-medium">{vehicle.vin}</td>
                  <td className="py-3 px-4">{vehicle.make} {vehicle.model}</td>
                  <td className="py-3 px-4">{vehicle.year}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      vehicle.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : vehicle.status === 'In Service' 
                        ? 'bg-blue-100 text-blue-800' 
                        : vehicle.status === 'Maintenance'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{vehicle.driver}</td>
                  <td className="py-3 px-4 text-gray-500">{vehicle.lastUpdated}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-600 hover:text-primary-600"
                        onClick={() => handleViewVehicle(vehicle)}
                        title="View vehicle details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button 
                        className="text-gray-600 hover:text-primary-600"
                        onClick={() => handleEditVehicle(vehicle)}
                        title="Edit vehicle details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      {vehicle.currentLoad && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                          {vehicle.currentLoad.vehicles.length}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of <span className="font-medium">6</span> vehicles
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
      {/* View Vehicle Modal */}
      {isViewModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Vehicle Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">VIN</div>
                    <div className="font-mono">{selectedVehicle.vin}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        selectedVehicle.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedVehicle.status === 'In Service' 
                          ? 'bg-blue-100 text-blue-800' 
                          : selectedVehicle.status === 'Maintenance'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Make / Model</div>
                    <div>{selectedVehicle.make} {selectedVehicle.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div>{selectedVehicle.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Assigned Driver</div>
                    <div>{selectedVehicle.driver || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div>{selectedVehicle.lastUpdated}</div>
                  </div>
                </div>
              </div>
              
              {/* Current Load Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Current Load</h3>
                {selectedVehicle.currentLoad ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="font-medium">Load #{selectedVehicle.currentLoad.id}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        selectedVehicle.currentLoad.status === 'In Transit' 
                          ? 'bg-blue-100 text-blue-800' 
                          : selectedVehicle.currentLoad.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedVehicle.currentLoad.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Pickup Location</div>
                        <div>{selectedVehicle.currentLoad.pickupLocation}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Dropoff Location</div>
                        <div>{selectedVehicle.currentLoad.dropoffLocation}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Progress</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${selectedVehicle.currentLoad.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {selectedVehicle.currentLoad.progress}% Complete
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Vehicles in Load ({selectedVehicle.currentLoad.vehicles.length})</div>
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                              <tr>
                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">Make</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">Model</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">Year</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-600">VIN</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedVehicle.currentLoad.vehicles.map((vehicle, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="py-2 px-3 text-sm">{vehicle.make}</td>
                                  <td className="py-2 px-3 text-sm">{vehicle.model}</td>
                                  <td className="py-2 px-3 text-sm">{vehicle.year}</td>
                                  <td className="py-2 px-3 text-sm font-mono">{vehicle.vin}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-10 w-10 text-gray-300 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <p className="text-sm">No active load assigned to this vehicle</p>
                    <p className="text-xs text-gray-400 mt-1">Vehicle is currently {selectedVehicle.status.toLowerCase()}</p>
                  </div>
                )}
              </div>
              
              {/* Latest Inspection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Latest Inspection</h3>
                {selectedVehicle.inspections && selectedVehicle.inspections.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Date</div>
                        <div>{new Date(selectedVehicle.inspections[0].date).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Inspector</div>
                        <div>{selectedVehicle.inspections[0].inspector}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          selectedVehicle.inspections[0].status === 'Passed' 
                            ? 'bg-green-100 text-green-800' 
                            : selectedVehicle.inspections[0].status === 'Failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedVehicle.inspections[0].status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Notes</div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        {selectedVehicle.inspections[0].notes}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Inspection Items</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedVehicle.inspections[0].items.map((item, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium">{item.name}</div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.status === 'Good' 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.status === 'Fair' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : item.status === 'Critical'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{item.notes}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedVehicle.inspections.length > 1 && (
                      <div className="mt-4 text-center">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View Inspection History ({selectedVehicle.inspections.length} records)
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-10 w-10 text-gray-300 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <p className="text-sm">No inspection records available</p>
                  </div>
                )}
              </div>
              
              {/* ELD Logs */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">ELD Logs</h3>
                {selectedVehicle.eldLogs && selectedVehicle.eldLogs.length > 0 ? (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Driving Hours</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">On Duty (not driving)</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Off Duty</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedVehicle.eldLogs.map((log, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{log.date}</td>
                              <td className="py-3 px-4">{log.driving} hrs</td>
                              <td className="py-3 px-4">{log.onDuty} hrs</td>
                              <td className="py-3 px-4">{log.offDuty} hrs</td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  log.status === 'Compliant' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              Driving hours are subject to DOT regulations. Drivers must not exceed 11 hours of driving after 10 consecutive hours off duty.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-10 w-10 text-gray-300 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No ELD logs available</p>
                    <p className="text-xs text-gray-400 mt-1">This data is only available for active vehicles with assigned drivers</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Vehicle Modal */}
      {isEditModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Vehicle
              </h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateVehicle(selectedVehicle);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                      VIN
                    </label>
                    <input
                      type="text"
                      id="vin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                      value={selectedVehicle.vin}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">VIN cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedVehicle.status}
                      onChange={(e) => setSelectedVehicle({...selectedVehicle, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="In Service">In Service</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Available">Available</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                      Make
                    </label>
                    <input
                      type="text"
                      id="make"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedVehicle.make}
                      onChange={(e) => setSelectedVehicle({...selectedVehicle, make: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedVehicle.model}
                      onChange={(e) => setSelectedVehicle({...selectedVehicle, model: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedVehicle.year}
                      onChange={(e) => setSelectedVehicle({...selectedVehicle, year: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Driver
                    </label>
                    <select
                      id="driver"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedVehicle.driverId || ''}
                      onChange={(e) => {
                        const driverId = e.target.value ? parseInt(e.target.value) : null;
                        const driverName = driverId 
                          ? driverOptions.find(d => d.id === driverId)?.name || 'Unassigned'
                          : 'Unassigned';
                        
                        setSelectedVehicle({
                          ...selectedVehicle, 
                          driverId: driverId,
                          driver: driverName
                        });
                      }}
                    >
                      <option value="">Unassigned</option>
                      {driverOptions.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}