'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateVehiclePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'Available',
    driverId: '',
    length: 20,
    capacity: 4,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Sample driver options
  const driverOptions = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
    { id: 5, name: 'James Wilson' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vin || formData.vin.length < 17) {
      newErrors.vin = 'Valid 17-character VIN is required';
    }
    
    if (!formData.make) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }

    if (!formData.length || formData.length < 1) {
      newErrors.length = 'Valid truck length is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Valid vehicle capacity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would make an API call to create the vehicle
      // For this demo, we'll just simulate a delay and show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Vehicle created:', formData);
      alert('Vehicle created successfully!');
      router.push('/dashboard/vehicles');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Error creating vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Truck</h1>
          <p className="text-gray-600">Add a new truck to your fleet</p>
        </div>
        <div>
          <Link 
            href="/dashboard/vehicles" 
            className="btn btn-ghost flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Fleet
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Truck Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                VIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vin"
                name="vin"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.vin ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.vin}
                onChange={handleChange}
                maxLength={17}
                placeholder="17-character VIN"
              />
              {errors.vin && (
                <p className="mt-1 text-sm text-red-600">{errors.vin}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Active">Active</option>
                <option value="In Service">In Service</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="make"
                name="make"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.make ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g., Ford, Chevrolet"
              />
              {errors.make && (
                <p className="mt-1 text-sm text-red-600">{errors.make}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="model"
                name="model"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.model ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., F-150, Silverado"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="year"
                name="year"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Driver
              </label>
              <select
                id="driverId"
                name="driverId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.driverId}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {driverOptions.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                Truck Length (ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="length"
                name="length"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.length ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.length}
                onChange={handleChange}
                min="1"
                max="100"
              />
              {errors.length && (
                <p className="mt-1 text-sm text-red-600">{errors.length}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Max Vehicle Capacity <span className="text-red-500">*</span>
              </label>
              <select
                id="capacity"
                name="capacity"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.capacity}
                onChange={handleChange}
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard/vehicles"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Add Truck
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}