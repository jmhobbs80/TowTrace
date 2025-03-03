import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { VehiclesAPI } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';

/**
 * VIN Scanner Interface
 * Allows users to scan vehicle VINs with a camera or enter them manually
 * Supports multi-vehicle scanning with photo capture
 */
export default function VINScannerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vinInput, setVinInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Special pattern for a valid VIN
  const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;

  // Check user auth on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Set up and clean up camera when showCamera changes
  useEffect(() => {
    let stream = null;

    const setupCamera = async () => {
      if (showCamera && !isCameraActive) {
        try {
          // Request camera access
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Prefer back camera on mobile
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError('Failed to access camera. Please check your permissions and try again.');
          setShowCamera(false);
        }
      }
    };

    setupCamera();

    // Cleanup function to stop camera when component unmounts or showCamera changes
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsCameraActive(false);
      }
    };
  }, [showCamera]);

  // Handle VIN input change
  const handleVinChange = (e) => {
    // Convert to uppercase and remove spaces
    const formatted = e.target.value.toUpperCase().replace(/\s/g, '');
    setVinInput(formatted);
    
    // Clear any previous lookup if the input changes
    if (vehicleData) {
      setVehicleData(null);
    }
  };

  // Validate a VIN
  const isValidVin = (vin) => {
    return vinPattern.test(vin);
  };

  // Look up VIN info from API
  const handleLookupVin = async () => {
    if (!isValidVin(vinInput)) {
      setError('Please enter a valid 17-character VIN.');
      return;
    }

    try {
      setLookupLoading(true);
      setError(null);
      
      const response = await VehiclesAPI.lookupVIN(vinInput);
      setVehicleData(response.data);
    } catch (err) {
      console.error('Error looking up VIN:', err);
      setError('Failed to look up VIN information. Please try again or enter details manually.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Take a photo using the camera
  const handleTakePhoto = () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL and add to photos array
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    if (photos.length < 4) { // Limit to 4 photos
      setPhotos([...photos, photoDataUrl]);
    }
  };

  // Handle file selection for photo upload
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    // Process only the first file
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    
    // Create a FileReader to read the selected image file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (photos.length < 4) { // Limit to 4 photos
        setPhotos([...photos, event.target.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove a photo from the photos array
  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // Save vehicle data
  const handleSaveVehicle = async () => {
    if (!vehicleData) {
      setError('Please scan or look up a VIN first.');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare vehicle data for API
      const vehiclePayload = {
        vin: vehicleData.vin,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        trim: vehicleData.trim,
        engine: vehicleData.engine,
        transmission: vehicleData.transmission,
        exteriorColor: vehicleData.exteriorColor,
        photos: photos,
        status: 'active'
      };
      
      // Add vehicle via API
      const response = await VehiclesAPI.addVehicle(vehiclePayload);
      
      // Add to saved vehicles list
      setSavedVehicles([...savedVehicles, response.data]);
      
      // Reset form for next vehicle
      setVinInput('');
      setVehicleData(null);
      setPhotos([]);
      
      // Show success message
      alert('Vehicle saved successfully!');
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError('Failed to save vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Start a job with saved vehicles
  const handleStartJob = () => {
    if (savedVehicles.length === 0) {
      setError('Please save at least one vehicle first.');
      return;
    }
    
    // Navigate to job creation page with vehicle IDs
    const vehicleIds = savedVehicles.map(v => v.id);
    router.push({
      pathname: '/dashboard/jobs/new',
      query: { vehicleIds: vehicleIds.join(',') }
    });
  };

  return (
    <>
      <Head>
        <title>VIN Scanner | TowTrace</title>
        <meta name="description" content="Scan vehicle VINs for transport jobs" />
      </Head>

      <DashboardLayout title="VIN Scanner">
        <div className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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

          {/* Main content - split into two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - VIN scanning and input */}
            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    VIN Entry
                  </h3>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <label htmlFor="vin" className="sr-only">VIN Number</label>
                      <input
                        type="text"
                        id="vin"
                        name="vin"
                        value={vinInput}
                        onChange={handleVinChange}
                        placeholder="Enter 17-character VIN"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleLookupVin}
                      disabled={lookupLoading || !vinInput || vinInput.length !== 17}
                      className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {lookupLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Looking up...
                        </>
                      ) : 'Lookup VIN'}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex">
                    <button
                      type="button"
                      onClick={() => setShowCamera(!showCamera)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {showCamera ? 'Hide Camera' : 'Show Camera'}
                    </button>
                    
                    <span className="mx-2 text-gray-500 self-center">or</span>
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Photo
                    </button>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Enter the 17-character VIN from the vehicle's VIN plate or scan it using the camera.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Camera Section */}
              {showCamera && (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Camera
                    </h3>
                    
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto rounded"
                        style={{ maxHeight: '320px' }}
                      />
                      
                      <button
                        type="button"
                        onClick={handleTakePhoto}
                        disabled={!isCameraActive}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                      </button>
                      
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Position the camera to clearly capture the VIN plate. The camera works best in good lighting.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Photos display */}
              {photos.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Vehicle Photos ({photos.length}/4)
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={photo} 
                            alt={`Vehicle photo ${index + 1}`} 
                            className="h-24 w-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white h-6 w-6 flex items-center justify-center hover:bg-red-700 focus:outline-none"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Lookup results and vehicle data */}
            <div className="space-y-6">
              {/* Vehicle Information */}
              {vehicleData ? (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Vehicle Information
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        VIN: {vehicleData.vin}
                      </p>
                    </div>
                    <div>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Make</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.make}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.model}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Year</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.year}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Trim</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.trim}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Engine</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.engine}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Transmission</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.transmission}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Exterior Color</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{vehicleData.exteriorColor}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSaveVehicle}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Vehicle'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicle data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a VIN or scan a VIN plate to see vehicle information.
                  </p>
                </div>
              )}
              
              {/* Saved vehicles list */}
              {savedVehicles.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Saved Vehicles ({savedVehicles.length})
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Vehicles added in this session
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {savedVehicles.map((vehicle) => (
                        <li key={vehicle.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </div>
                                <div className="text-sm text-gray-500">
                                  VIN: {vehicle.vin}
                                </div>
                              </div>
                            </div>
                            <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                              <a className="text-sm text-blue-600 hover:text-blue-900">View</a>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleStartJob}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Create Job with These Vehicles
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <Link href="/dashboard/vehicles">
              <a className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Back to Vehicles
              </a>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}