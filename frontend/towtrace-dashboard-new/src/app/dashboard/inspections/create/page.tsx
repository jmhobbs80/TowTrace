'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define inspection item type
type InspectionItem = {
  id: string;
  name: string;
  status: 'Pass' | 'Fail' | 'N/A';
  notes: string;
  photoRequired: boolean;
  photo?: File | null;
};

export default function CreateInspectionPage() {
  const router = useRouter();
  
  // State for the vehicle information
  const [vehicle, setVehicle] = useState({
    id: '',
    vin: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    odometer: '',
  });
  
  // State for all inspection items with FMCSA requirements
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 'brakes', name: 'Brakes', status: 'N/A', notes: '', photoRequired: false },
    { id: 'lights', name: 'Lights & Reflectors', status: 'N/A', notes: '', photoRequired: false },
    { id: 'steering', name: 'Steering Mechanism', status: 'N/A', notes: '', photoRequired: false },
    { id: 'tires', name: 'Tires', status: 'N/A', notes: '', photoRequired: false },
    { id: 'horn', name: 'Horn', status: 'N/A', notes: '', photoRequired: false },
    { id: 'wipers', name: 'Windshield Wipers', status: 'N/A', notes: '', photoRequired: false },
    { id: 'mirrors', name: 'Mirrors', status: 'N/A', notes: '', photoRequired: false },
    { id: 'emergency', name: 'Emergency Equipment', status: 'N/A', notes: '', photoRequired: false },
    { id: 'couplingDevices', name: 'Coupling Devices', status: 'N/A', notes: '', photoRequired: false },
    { id: 'wheels', name: 'Wheels & Rims', status: 'N/A', notes: '', photoRequired: false },
    { id: 'emergencyBrakes', name: 'Emergency Brakes', status: 'N/A', notes: '', photoRequired: false },
  ]);
  
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectionType, setInspectionType] = useState<'pre-trip' | 'post-trip'>('pre-trip');
  
  // Handle vehicle input changes
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicle({
      ...vehicle,
      [name]: value,
    });
  };
  
  // Handle inspection item status change
  const handleItemStatusChange = (id: string, status: 'Pass' | 'Fail' | 'N/A') => {
    setInspectionItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          // If status is changing to Fail, mark photo as required
          const photoRequired = status === 'Fail';
          return { ...item, status, photoRequired };
        }
        return item;
      })
    );
  };
  
  // Handle inspection item notes change
  const handleItemNotesChange = (id: string, notes: string) => {
    setInspectionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };
  
  // Handle photo upload for inspection item
  const handlePhotoUpload = (id: string, file: File | null) => {
    setInspectionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, photo: file } : item
      )
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Check if VIN is provided
      if (!vehicle.vin.trim()) {
        alert('VIN is required');
        setIsSubmitting(false);
        return;
      }
      
      // Check if at least one item has been inspected
      const hasInspectedItems = inspectionItems.some(item => item.status !== 'N/A');
      if (!hasInspectedItems) {
        alert('At least one inspection item must be evaluated');
        setIsSubmitting(false);
        return;
      }
      
      // Check if any failed items are missing photos
      const failedItemsMissingPhotos = inspectionItems.filter(
        item => item.status === 'Fail' && !item.photo
      );
      
      if (failedItemsMissingPhotos.length > 0) {
        alert(`Please add photos for all failed inspection items: ${failedItemsMissingPhotos.map(item => item.name).join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      // In a real app, this would submit to an API
      console.log('Submitting inspection:', {
        vehicle,
        inspectionItems,
        notes,
        inspectionType,
        timestamp: new Date().toISOString(),
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success and redirect
      alert('Inspection submitted successfully!');
      router.push('/dashboard/inspections');
      
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert('Failed to submit inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Styling function for status buttons
  const getStatusButtonClass = (itemStatus: string, buttonStatus: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium ";
    
    if (itemStatus === buttonStatus) {
      if (buttonStatus === 'Pass') return baseClass + "bg-green-500 text-white";
      if (buttonStatus === 'Fail') return baseClass + "bg-red-500 text-white";
      return baseClass + "bg-gray-500 text-white";
    }
    
    if (buttonStatus === 'Pass') return baseClass + "bg-green-100 text-green-800 hover:bg-green-200";
    if (buttonStatus === 'Fail') return baseClass + "bg-red-100 text-red-800 hover:bg-red-200";
    return baseClass + "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/inspections" className="text-primary-600 hover:text-primary-700 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New FMCSA Inspection</h1>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Complete this FMCSA-compliant inspection form. Photos are required for any failed items.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Inspection Type</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setInspectionType('pre-trip')}
                className={`px-4 py-2 rounded-md ${
                  inspectionType === 'pre-trip'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pre-Trip Inspection
              </button>
              <button
                type="button"
                onClick={() => setInspectionType('post-trip')}
                className={`px-4 py-2 rounded-md ${
                  inspectionType === 'post-trip'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Post-Trip Inspection
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                  VIN *
                </label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={vehicle.vin}
                  onChange={handleVehicleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={vehicle.licensePlate}
                  onChange={handleVehicleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                  Make
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={vehicle.make}
                  onChange={handleVehicleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={vehicle.model}
                  onChange={handleVehicleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={vehicle.year}
                  onChange={handleVehicleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer Reading
                </label>
                <input
                  type="text"
                  id="odometer"
                  name="odometer"
                  value={vehicle.odometer}
                  onChange={handleVehicleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Current mileage"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Inspection Items</h2>
            <p className="text-sm text-gray-500 mt-1">All failed items require a photo upload and notes</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {inspectionItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <div className="mt-2 sm:mt-0 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'Pass')}
                        className={getStatusButtonClass(item.status, 'Pass')}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'Fail')}
                        className={getStatusButtonClass(item.status, 'Fail')}
                      >
                        Fail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(item.id, 'N/A')}
                        className={getStatusButtonClass(item.status, 'N/A')}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                  
                  {item.status !== 'N/A' && (
                    <div className="mt-3">
                      <label htmlFor={`notes-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Notes {item.status === 'Fail' && <span className="text-red-600">*</span>}
                      </label>
                      <textarea
                        id={`notes-${item.id}`}
                        value={item.notes}
                        onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                        required={item.status === 'Fail'}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                  
                  {item.photoRequired && (
                    <div className="mt-3">
                      <label htmlFor={`photo-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Photo Upload <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="file"
                          id={`photo-${item.id}`}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handlePhotoUpload(item.id, file);
                          }}
                          required
                          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {item.photo && (
                          <span className="ml-2 text-sm text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Photo added
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
          </div>
          
          <div className="p-6">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows={4}
              placeholder="Enter any additional notes or observations"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard/inspections"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
          </button>
        </div>
      </form>
    </div>
  );
}