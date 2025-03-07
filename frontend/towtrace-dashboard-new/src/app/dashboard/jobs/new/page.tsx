'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Type definitions
type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type Vehicle = {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: string;
};

// Type for address suggestions
type AddressSuggestion = {
  id: string;
  description: string;
  placeId: string;
};

// Navigation app options
type NavigationApp = 'apple' | 'google' | 'waze' | 'truckerpath';

export default function NewJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Reference for dropdown handling
  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);
  
  // Address autocomplete suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    email: '',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: 'car',
    description: '',
    driverId: '',
    vehicleId: '',
    scheduledAt: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
    vin: '',
    year: '',
    scheduledAt: '',
    driverId: ''
  });

  // Vehicles for bulk pickup
  const [bulkVehicles, setBulkVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
  });
  
  // Drivers from database
  const [drivers, setDrivers] = useState<{id: string, name: string}[]>([]);
  
  // Vehicles for dropdown with API fetch
  const [vehicles, setVehicles] = useState([]);
  
  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        const data = await response.json();
        setVehicles(data.vehicles || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Fetch drivers from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/drivers');
        const data = await response.json();
        setDrivers(data.drivers || []);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    
    fetchDrivers();
  }, []);

  // Real address autocomplete using Places API
  const fetchAddressSuggestions = async (query: string, type: 'pickup' | 'dropoff') => {
    if (query.length < 3) {
      type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }
    
    try {
      // Call real Places API endpoint
      const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions');
      }
      
      const data = await response.json();
      const suggestions: AddressSuggestion[] = data.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        description: prediction.description,
        placeId: prediction.place_id
      }));
      
      type === 'pickup' ? setPickupSuggestions(suggestions) : setDropoffSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      // Fallback to empty suggestions on error
      type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
    }
  };

  // Show navigation app selection dialog
  const showNavigationOptions = (address: string) => {
    const apps: {name: NavigationApp, label: string}[] = [
      { name: 'apple', label: 'Apple Maps' },
      { name: 'google', label: 'Google Maps' },
      { name: 'waze', label: 'Waze' },
      { name: 'truckerpath', label: 'Trucker Path' }
    ];
    
    // In a real implementation, this would open the address in the selected app
    const app = window.confirm(`Navigate to ${address} using:\n\n- Apple Maps\n- Google Maps\n- Waze\n- Trucker Path`);
    if (app) {
      // This would launch the selected app with the address
      console.log(`Navigating to ${address}`);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle client search dropdown
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowClientSearch(false);
      }
      
      // Handle pickup location dropdown
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupSuggestions(false);
      }
      
      // Handle dropoff location dropdown
      if (dropoffRef.current && !dropoffRef.current.contains(event.target as Node)) {
        setShowDropoffSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Select client from search results
  const selectClient = (client: Client) => {
    setFormData({
      ...formData,
      client: client.name,
      phone: client.phone,
      email: client.email
    });
    setShowClientSearch(false);
    setSearchTerm('');
  };

  // Select address from suggestions
  const selectAddress = (suggestion: AddressSuggestion, type: 'pickup' | 'dropoff') => {
    setFormData({
      ...formData,
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: suggestion.description
    });
    
    type === 'pickup' ? setShowPickupSuggestions(false) : setShowDropoffSuggestions(false);
  };

  // Add vehicle to bulk list
  const addVehicle = () => {
    // Validate VIN and year
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    const yearRegex = /^(19|20)\d{2}$/;
    
    let hasErrors = false;
    const newErrors = { ...errors };
    
    if (!vinRegex.test(newVehicle.vin)) {
      newErrors.vin = 'Please enter a valid 17-character VIN';
      hasErrors = true;
    } else {
      newErrors.vin = '';
    }
    
    if (!yearRegex.test(newVehicle.year)) {
      newErrors.year = 'Please enter a valid year (1900-2099)';
      hasErrors = true;
    } else {
      newErrors.year = '';
    }
    
    setErrors(newErrors);
    
    if (!hasErrors && newVehicle.vin && newVehicle.make && newVehicle.model) {
      setBulkVehicles([
        ...bulkVehicles, 
        { 
          id: Date.now().toString(), // Temporary ID for the list
          ...newVehicle 
        }
      ]);
      // Reset form
      setNewVehicle({
        vin: '',
        make: '',
        model: '',
        year: '',
      });
    }
  };

  // Remove vehicle from bulk list
  const removeVehicle = (id: string) => {
    setBulkVehicles(bulkVehicles.filter(vehicle => vehicle.id !== id));
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validation for phone and email
    if (name === 'phone') {
      const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
      setErrors({
        ...errors,
        phone: phoneRegex.test(value) ? '' : 'Please enter a valid phone number'
      });
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors({
        ...errors,
        email: emailRegex.test(value) ? '' : 'Please enter a valid email address'
      });
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Address autocomplete
    if (name === 'pickupLocation') {
      fetchAddressSuggestions(value, 'pickup');
      setShowPickupSuggestions(true);
    }
    
    if (name === 'dropoffLocation') {
      fetchAddressSuggestions(value, 'dropoff');
      setShowDropoffSuggestions(true);
    }
  };

  // Handle vehicle form input changes
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validation for VIN and year
    if (name === 'vin') {
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
      setErrors({
        ...errors,
        vin: vinRegex.test(value) ? '' : 'Please enter a valid 17-character VIN'
      });
    }
    
    if (name === 'year') {
      const yearRegex = /^(19|20)\d{2}$/;
      setErrors({
        ...errors,
        year: yearRegex.test(value) ? '' : 'Please enter a valid year (1900-2099)'
      });
    }
    
    setNewVehicle({
      ...newVehicle,
      [name]: value,
    });
  };
  
  // Validate scheduled date is at least 10 minutes in the future
  const validateScheduledDate = (dateTimeStr: string): boolean => {
    if (!dateTimeStr) return false;
    
    const scheduledDate = new Date(dateTimeStr);
    const currentDate = new Date();
    
    // Add 10 minutes to current time for minimum scheduling window
    const minScheduleTime = new Date(currentDate.getTime() + 10 * 60 * 1000);
    
    return scheduledDate >= minScheduleTime;
  };
  
  // Show confirmation screen
  const showConfirmationScreen = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields and formats
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const newErrors = {
      phone: formData.phone ? (phoneRegex.test(formData.phone) ? '' : 'Please enter a valid phone number') : '',
      email: formData.email ? (emailRegex.test(formData.email) ? '' : 'Please enter a valid email address') : '',
      vin: '',
      year: '',
      scheduledAt: formData.scheduledAt ? (validateScheduledDate(formData.scheduledAt) ? '' : 'Scheduled time must be at least 10 minutes in the future') : 'Scheduled time is required',
      driverId: formData.driverId ? '' : 'Please select a driver'
    };
    
    setErrors(newErrors);
    
    // Check if at least one contact method is provided
    const hasContactMethod = (formData.phone && !newErrors.phone) || (formData.email && !newErrors.email);
    
    // Check if all required fields are filled
    const requiredFieldsFilled = 
      formData.client &&
      formData.pickupLocation && 
      formData.dropoffLocation && 
      !newErrors.scheduledAt &&
      !newErrors.driverId && 
      hasContactMethod;
    
    if (requiredFieldsFilled) {
      setShowConfirmation(true);
    } else if (!hasContactMethod) {
      // Show specific error for contact methods
      alert('Either a valid phone number or email address is required');
    }
  };
  
  // Handle final form submission after confirmation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // This would be an actual API call to create the job
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vehicles: bulkVehicles.length > 0 ? bulkVehicles : undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      // Redirect to jobs list on success
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('There was an error creating the job. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  // If confirmation modal is shown, render the confirmation screen
  if (showConfirmation) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowConfirmation(false)}
            className="text-primary-600 hover:text-primary-700 mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Confirm Job Details</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client Name</p>
                <p className="text-base">{formData.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-base">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{formData.email}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                <p className="text-base">{formData.pickupLocation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dropoff Location</p>
                <p className="text-base">{formData.dropoffLocation}</p>
              </div>
              {formData.scheduledAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Scheduled Date & Time</p>
                  <p className="text-base">{new Date(formData.scheduledAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          
          {bulkVehicles.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Vehicles ({bulkVehicles.length})</h2>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkVehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.vin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                  <p className="text-base capitalize">{formData.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base">{formData.description || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Driver</p>
                <p className="text-base">{formData.driverId ? drivers.find(d => d.id === formData.driverId)?.name || formData.driverId : 'Not assigned'}</p>
              </div>
              {!bulkVehicles.length && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle</p>
                  <p className="text-base">{formData.vehicleId ? vehicles.find(v => v.id === formData.vehicleId)?.name || formData.vehicleId : 'Not assigned'}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Confirm & Create Job"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/jobs" className="text-primary-600 hover:text-primary-700 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={showConfirmationScreen}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">New Job Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Client Information</h2>
              
              <div className="mb-4 relative" ref={searchRef}>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    onFocus={() => setShowClientSearch(true)}
                    autoComplete="off"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter client name"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSearch(!showClientSearch)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </button>
                </div>
                
                {showClientSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <div 
                            key={client.id} 
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => selectClient(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.phone}</div>
                            <div className="text-sm text-gray-600">{client.email}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          {searchTerm.length > 1 ? 'No clients found' : 'Type to search'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@example.com"
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Location Details</h2>
              
              <div className="mb-4 relative" ref={pickupRef}>
                <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    onFocus={() => setShowPickupSuggestions(true)}
                    required
                    placeholder="Enter pickup address"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
                    <div className="max-h-60 overflow-y-auto">
                      {pickupSuggestions.map(suggestion => (
                        <div 
                          key={suggestion.id} 
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => selectAddress(suggestion, 'pickup')}
                        >
                          <div className="text-sm">{suggestion.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4 relative" ref={dropoffRef}>
                <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Dropoff Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="dropoffLocation"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    onFocus={() => setShowDropoffSuggestions(true)}
                    required
                    placeholder="Enter dropoff address"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-300">
                    <div className="max-h-60 overflow-y-auto">
                      {dropoffSuggestions.map(suggestion => (
                        <div 
                          key={suggestion.id} 
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => selectAddress(suggestion, 'dropoff')}
                        >
                          <div className="text-sm">{suggestion.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full border ${errors.scheduledAt ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.scheduledAt && <p className="mt-1 text-sm text-red-600">{errors.scheduledAt}</p>}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Bulk Vehicle Pickup</h2>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={newVehicle.vin}
                    onChange={handleVehicleChange}
                    placeholder="17-character VIN"
                    className={`w-full border ${errors.vin ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.vin && <p className="mt-1 text-sm text-red-600">{errors.vin}</p>}
                </div>
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    value={newVehicle.make}
                    onChange={handleVehicleChange}
                    placeholder="e.g. Ford"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    value={newVehicle.model}
                    onChange={handleVehicleChange}
                    placeholder="e.g. F-150"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    value={newVehicle.year}
                    onChange={handleVehicleChange}
                    placeholder="e.g. 2022"
                    className={`w-full border ${errors.year ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={addVehicle}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newVehicle.vin || !newVehicle.make || !newVehicle.model || !newVehicle.year || !!errors.vin || !!errors.year}
                >
                  Add Vehicle
                </button>
              </div>
            </div>
            
            {bulkVehicles.length > 0 && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkVehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.vin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Assignment</h2>
                
                <div className="mb-4">
                  <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Driver
                  </label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    required
                    className={`w-full border ${errors.driverId ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                  {errors.driverId && <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <Link
              href="/dashboard/jobs"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Job Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}