'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddDriverPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Contact Info, 3: Qualifications, 4: Review
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiration: '',
    
    // Step 2: Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Step 3: Qualifications & Employment
    yearsExperience: '',
    cdlClass: '',
    endorsements: [],
    status: 'Off Duty',
    assignedVehicleId: '',
    startDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Available CDL classes
  const cdlClasses = ['Class A', 'Class B', 'Class C'];
  
  // Available endorsements
  const availableEndorsements = [
    { id: 'H', name: 'Hazardous Materials (H)' },
    { id: 'N', name: 'Tank Vehicles (N)' },
    { id: 'P', name: 'Passenger Transport (P)' },
    { id: 'T', name: 'Double/Triple Trailers (T)' },
    { id: 'X', name: 'Combination of Tank Vehicle and Hazardous Materials (X)' },
  ];
  
  // Available vehicles for assignment
  const availableVehicles = [
    { id: 'v1', name: 'Truck 101 - Honda Accord' },
    { id: 'v2', name: 'Truck 202 - Tesla Model S' },
    { id: 'v3', name: 'Truck 303 - Chevrolet Malibu' },
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  // Handle checkbox changes for endorsements
  const handleEndorsementChange = (endorsementId) => {
    const currentEndorsements = [...formData.endorsements];
    
    if (currentEndorsements.includes(endorsementId)) {
      // Remove if already selected
      setFormData({
        ...formData,
        endorsements: currentEndorsements.filter(id => id !== endorsementId),
      });
    } else {
      // Add if not selected
      setFormData({
        ...formData,
        endorsements: [...currentEndorsements, endorsementId],
      });
    }
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate Step 1: Basic Information
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!formData.licenseState) newErrors.licenseState = 'License state is required';
      if (!formData.licenseExpiration) newErrors.licenseExpiration = 'License expiration date is required';
      else {
        // Check if license is expired
        const expirationDate = new Date(formData.licenseExpiration);
        if (expirationDate < new Date()) {
          newErrors.licenseExpiration = 'License is expired';
        }
      }
    } 
    else if (step === 2) {
      // Validate Step 2: Contact Information
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone) && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number should be in the format (XXX) XXX-XXXX';
      }
      
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    }
    else if (step === 3) {
      // Validate Step 3: Qualifications & Employment
      if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required';
      if (!formData.cdlClass) newErrors.cdlClass = 'CDL class is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
      if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would submit to an API
      console.log('Submitting driver data:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert('Driver onboarded successfully!');
      router.push('/dashboard/drivers');
    } catch (error) {
      console.error('Error submitting driver data:', error);
      alert('There was an error onboarding the driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format the user-friendly display of endorsements
  const getEndorsementDisplay = () => {
    if (!formData.endorsements.length) return 'None';
    
    return formData.endorsements.map(id => {
      const endorsement = availableEndorsements.find(e => e.id === id);
      return endorsement ? endorsement.id : id;
    }).join(', ');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Onboard New Driver</h1>
            <Link
              href="/dashboard/drivers"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Drivers
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                <li className={`relative pr-8 sm:pr-20 ${step === 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); step > 1 && setStep(1); }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 1
                        ? 'border-primary-600 bg-primary-600 hover:bg-primary-800'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${step >= 1 ? 'text-white' : 'text-gray-500'} text-sm font-medium`}>1</span>
                    <span className="absolute -bottom-8 text-sm font-medium text-center w-max" style={{ left: '-50%', right: '-50%' }}>Basic Info</span>
                  </a>
                </li>

                <li className={`relative px-8 sm:px-20 ${step === 2 ? 'text-primary-600' : 'text-gray-500'}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); step > 2 && setStep(2); }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 2
                        ? 'border-primary-600 bg-primary-600 hover:bg-primary-800'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${step >= 2 ? 'text-white' : 'text-gray-500'} text-sm font-medium`}>2</span>
                    <span className="absolute -bottom-8 text-sm font-medium text-center w-max" style={{ left: '-50%', right: '-50%' }}>Contact</span>
                  </a>
                </li>

                <li className={`relative px-8 sm:px-20 ${step === 3 ? 'text-primary-600' : 'text-gray-500'}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); step > 3 && setStep(3); }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 3
                        ? 'border-primary-600 bg-primary-600 hover:bg-primary-800'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${step >= 3 ? 'text-white' : 'text-gray-500'} text-sm font-medium`}>3</span>
                    <span className="absolute -bottom-8 text-sm font-medium text-center w-max" style={{ left: '-50%', right: '-50%' }}>Qualifications</span>
                  </a>
                </li>

                <li className={`relative pl-8 sm:pl-20 ${step === 4 ? 'text-primary-600' : 'text-gray-500'}`}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); step > 4 && setStep(4); }}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 4
                        ? 'border-primary-600 bg-primary-600 hover:bg-primary-800'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`${step >= 4 ? 'text-white' : 'text-gray-500'} text-sm font-medium`}>4</span>
                    <span className="absolute -bottom-8 text-sm font-medium text-center w-max" style={{ left: '-50%', right: '-50%' }}>Review</span>
                  </a>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* Form Container */}
          <div className="mt-12 bg-white shadow-sm rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.firstName ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.lastName ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        Date of birth <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.dateOfBirth ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        Driver's license number <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.licenseNumber ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.licenseNumber && (
                          <p className="mt-2 text-sm text-red-600">{errors.licenseNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="licenseState" className="block text-sm font-medium text-gray-700">
                        License state <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="licenseState"
                          name="licenseState"
                          value={formData.licenseState}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.licenseState ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">Select a state</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          <option value="WA">Washington</option>
                          {/* Add all states here */}
                        </select>
                        {errors.licenseState && (
                          <p className="mt-2 text-sm text-red-600">{errors.licenseState}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="licenseExpiration" className="block text-sm font-medium text-gray-700">
                        License expiration date <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="licenseExpiration"
                          name="licenseExpiration"
                          value={formData.licenseExpiration}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.licenseExpiration ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.licenseExpiration && (
                          <p className="mt-2 text-sm text-red-600">{errors.licenseExpiration}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.email ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.phone ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street address <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.address ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.address && (
                          <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.city ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.state ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">Select a state</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          <option value="WA">Washington</option>
                          {/* Add all states here */}
                        </select>
                        {errors.state && (
                          <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP code <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.zipCode ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.zipCode && (
                          <p className="mt-2 text-sm text-red-600">{errors.zipCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Qualifications & Employment */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Qualifications & Employment</h2>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                        Years of experience <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="yearsExperience"
                          name="yearsExperience"
                          min="0"
                          max="50"
                          value={formData.yearsExperience}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.yearsExperience ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.yearsExperience && (
                          <p className="mt-2 text-sm text-red-600">{errors.yearsExperience}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="cdlClass" className="block text-sm font-medium text-gray-700">
                        CDL class <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="cdlClass"
                          name="cdlClass"
                          value={formData.cdlClass}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.cdlClass ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">Select CDL class</option>
                          {cdlClasses.map((cdlClass) => (
                            <option key={cdlClass} value={cdlClass}>
                              {cdlClass}
                            </option>
                          ))}
                        </select>
                        {errors.cdlClass && (
                          <p className="mt-2 text-sm text-red-600">{errors.cdlClass}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start date <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.startDate ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.startDate && (
                          <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endorsements
                      </label>
                      <div className="space-y-2">
                        {availableEndorsements.map((endorsement) => (
                          <div key={endorsement.id} className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`endorsement-${endorsement.id}`}
                                name={`endorsement-${endorsement.id}`}
                                type="checkbox"
                                checked={formData.endorsements.includes(endorsement.id)}
                                onChange={() => handleEndorsementChange(endorsement.id)}
                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`endorsement-${endorsement.id}`} className="font-medium text-gray-700">
                                {endorsement.name}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Initial status
                      </label>
                      <div className="mt-1">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="Off Duty">Off Duty</option>
                          <option value="On Duty">On Duty</option>
                          <option value="On Break">On Break</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="assignedVehicleId" className="block text-sm font-medium text-gray-700">
                        Assigned vehicle
                      </label>
                      <div className="mt-1">
                        <select
                          id="assignedVehicleId"
                          name="assignedVehicleId"
                          value={formData.assignedVehicleId}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="">No assignment</option>
                          {availableVehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                        Emergency contact name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.emergencyContactName ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.emergencyContactName && (
                          <p className="mt-2 text-sm text-red-600">{errors.emergencyContactName}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                        Emergency contact phone <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          placeholder="(555) 123-4567"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.emergencyContactPhone ? 'border-red-300' : ''
                          }`}
                        />
                        {errors.emergencyContactPhone && (
                          <p className="mt-2 text-sm text-red-600">{errors.emergencyContactPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review Information */}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Review Information</h2>
                  
                  <div className="border border-gray-200 rounded-md p-4 mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.firstName} {formData.lastName}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.dateOfBirth}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">License number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.licenseNumber}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">License state</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.licenseState}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">License expiration</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.licenseExpiration}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4 mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Contact Information</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Email address</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.phone}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formData.address}<br />
                          {formData.city}, {formData.state} {formData.zipCode}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Qualifications & Employment</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Years of experience</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.yearsExperience}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">CDL class</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.cdlClass}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Endorsements</dt>
                        <dd className="mt-1 text-sm text-gray-900">{getEndorsementDisplay()}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Start date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.startDate}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Initial status</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.status}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Assigned vehicle</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formData.assignedVehicleId
                            ? availableVehicles.find(v => v.id === formData.assignedVehicleId)?.name || 'Unknown'
                            : 'None'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Emergency contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formData.emergencyContactName}, {formData.emergencyContactPhone}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                ) : (
                  <div></div> // Empty div for spacing
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                    <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Submit
                        <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}