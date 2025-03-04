'use client';

import Link from 'next/link';

export default function DriversPage() {
  // Sample drivers data with GPS coordinates and general location
  const drivers = [
    { 
      id: 1, 
      name: "John Smith", 
      phone: "(555) 123-4567", 
      email: "john.smith@example.com", 
      status: "On Duty", 
      location: "Downtown Phoenix", 
      generalLocation: "Downtown Area",
      coordinates: { lat: 33.4484, lng: -112.0740 },
      assignedVehicle: "Honda Accord", 
      lastUpdate: "15 minutes ago",
      batteryFriendly: true,
      activeLoads: 2
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      phone: "(555) 987-6543", 
      email: "sarah.j@example.com", 
      status: "Off Duty", 
      location: "N/A", 
      generalLocation: "N/A",
      coordinates: null,
      assignedVehicle: "None", 
      lastUpdate: "2 hours ago",
      batteryFriendly: false,
      activeLoads: 0
    },
    { 
      id: 3, 
      name: "Michael Brown", 
      phone: "(555) 456-7890", 
      email: "m.brown@example.com", 
      status: "On Duty", 
      location: "North Scottsdale", 
      generalLocation: "Scottsdale Area",
      coordinates: { lat: 33.6695, lng: -111.9235 },
      assignedVehicle: "Tesla Model S", 
      lastUpdate: "5 minutes ago",
      batteryFriendly: true,
      activeLoads: 1
    },
    { 
      id: 4, 
      name: "Emily Davis", 
      phone: "(555) 789-0123", 
      email: "emily.d@example.com", 
      status: "On Break", 
      location: "Tempe", 
      generalLocation: "Tempe Area",
      coordinates: { lat: 33.4255, lng: -111.9400 },
      assignedVehicle: "Chevrolet Malibu", 
      lastUpdate: "45 minutes ago",
      batteryFriendly: true,
      activeLoads: 3
    },
    { 
      id: 5, 
      name: "James Wilson", 
      phone: "(555) 234-5678", 
      email: "jwilson@example.com", 
      status: "Off Duty", 
      location: "N/A", 
      generalLocation: "N/A",
      coordinates: null,
      assignedVehicle: "None", 
      lastUpdate: "1 day ago",
      batteryFriendly: false,
      activeLoads: 0
    },
  ];
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage your driver fleet</p>
        </div>
        <div>
          <Link href="/dashboard/drivers/new" className="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Driver
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Drivers</h2>
          <div className="flex items-center">
            <div className="mr-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search drivers..." 
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
              <option value="on-duty">On Duty</option>
              <option value="off-duty">Off Duty</option>
              <option value="on-break">On Break</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Assigned Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Last Update</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{driver.id}</td>
                  <td className="py-3 px-4 font-medium">{driver.name}</td>
                  <td className="py-3 px-4">
                    <div>{driver.phone}</div>
                    <div className="text-xs text-gray-500">{driver.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      driver.status === 'On Duty' 
                        ? 'bg-green-100 text-green-800' 
                        : driver.status === 'Off Duty' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {driver.status !== 'Off Duty' && driver.batteryFriendly && (
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Battery-friendly GPS active"></span>
                      )}
                      <span>{driver.generalLocation}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{driver.assignedVehicle}</td>
                  <td className="py-3 px-4 text-gray-500">{driver.lastUpdate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/drivers/${driver.id}`} className="text-gray-600 hover:text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      <Link href={`/dashboard/drivers/edit/${driver.id}`} className="text-gray-600 hover:text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      {driver.status !== 'Off Duty' && driver.activeLoads > 0 && (
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            {driver.activeLoads}
                          </span>
                        </div>
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
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> drivers
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
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Driver Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-green-700 font-medium">On Duty</div>
                <div className="text-2xl font-bold text-green-800">2</div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-700 font-medium">Off Duty</div>
                <div className="text-2xl font-bold text-gray-800">2</div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-yellow-700 font-medium">On Break</div>
                <div className="text-2xl font-bold text-yellow-800">1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}