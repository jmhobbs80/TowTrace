'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function EditDriverPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driver, setDriver] = useState({
    id: 0,
    name: '',
    phone: '',
    email: '',
    status: 'On Duty',
    assignedVehicle: '',
    batteryFriendly: true
  });
  
  // Load driver data
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock driver data based on ID
        let mockDriver = {
          id: driverId,
          name: "John Smith",
          phone: "(555) 123-4567",
          email: "john.smith@example.com",
          status: "On Duty",
          assignedVehicle: "Honda Accord",
          batteryFriendly: true
        };
        
        if (driverId === 3) {
          mockDriver = {
            id: 3,
            name: "Michael Brown",
            phone: "(555) 456-7890",
            email: "m.brown@example.com",
            status: "On Duty",
            assignedVehicle: "Tesla Model S",
            batteryFriendly: true
          };
        } else if (driverId === 4) {
          mockDriver = {
            id: 4,
            name: "Emily Davis",
            phone: "(555) 789-0123",
            email: "emily.d@example.com",
            status: "On Break",
            assignedVehicle: "Chevrolet Malibu",
            batteryFriendly: true
          };
        }
        
        setDriver(mockDriver);
      } catch (err) {
        console.error('Error fetching driver details:', err);
        setError('Failed to load driver information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriver();
  }, [driverId]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, this would be an API call to update the driver
      console.log('Updating driver:', driver);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success message
      alert('Driver information updated successfully!');
      
      // Redirect back to driver list
      router.push('/dashboard/drivers');
    } catch (err) {
      console.error('Error updating driver:', err);
      setError('Failed to update driver. Please try again.');
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDriver({
      ...driver,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/drivers" className="text-primary-600 hover:text-primary-700 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Driver</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={driver.name}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={driver.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={driver.phone}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={driver.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="On Break">On Break</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="assignedVehicle" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Vehicle
                </label>
                <input
                  type="text"
                  id="assignedVehicle"
                  name="assignedVehicle"
                  value={driver.assignedVehicle}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank if no vehicle is assigned</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="batteryFriendly"
                    name="batteryFriendly"
                    checked={driver.batteryFriendly}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="batteryFriendly" className="ml-2 block text-sm text-gray-700">
                    Enable battery-friendly GPS tracking (updates location every 5 minutes)
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  When enabled, the driver's location will be tracked in a way that conserves battery life
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <Link 
                href="/dashboard/drivers" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
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
      
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 text-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p>
              Updates to driver information will be synchronized with mobile devices the next time they connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}