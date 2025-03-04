'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VINScanPage() {
  const [vinInput, setVinInput] = useState('');
  const [scannedVINs, setScannedVINs] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to simulate VIN scanning
  const handleScan = () => {
    if (!vinInput.trim()) return;
    
    setIsScanning(true);
    
    // Simulate API call
    setTimeout(() => {
      setScannedVINs([...scannedVINs, vinInput]);
      setVinInput('');
      setIsScanning(false);
    }, 1500);
  };
  
  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Limit to 4 images
    if (images.length >= 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setImages([...images, event.target.result]);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Function to remove a scanned VIN
  const removeVIN = (index: number) => {
    const updatedVINs = [...scannedVINs];
    updatedVINs.splice(index, 1);
    setScannedVINs(updatedVINs);
  };
  
  // Function to remove an image
  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };
  
  // Function to submit the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (scannedVINs.length === 0) {
      alert('Please scan at least one VIN');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Vehicles added successfully!');
      setIsSubmitting(false);
      setScannedVINs([]);
      setImages([]);
      
      // Navigate back to vehicles page
      window.location.href = '/dashboard/vehicles';
    }, 2000);
  };
  
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center mb-1">
          <Link href="/dashboard/vehicles" className="text-primary-600 hover:text-primary-700 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Vehicle VIN Scanner</h1>
        </div>
        <p className="text-gray-600">Scan multiple VINs and add them to the driver's load. Trucks have a max vehicle capacity and drivers must mark vehicles dropped before scanning a new load.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">VIN Scanner</h2>
            
            <div className="mb-6">
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                Enter VIN or Use Scanner
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="vin"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. 1HGCM82633A123456"
                  maxLength={17}
                />
                <button
                  onClick={handleScan}
                  disabled={isScanning || !vinInput.trim()}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-r-md px-4 py-2 disabled:opacity-50"
                >
                  {isScanning ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Scan</span>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 17-character Vehicle Identification Number
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Photos (Optional, max 4)
              </label>
              <div className="flex flex-col space-y-3">
                {/* Camera button */}
                <button 
                  className="flex items-center justify-center bg-primary-50 text-primary-700 border border-primary-200 rounded-md py-3 hover:bg-primary-100 transition-colors"
                  onClick={() => document.getElementById('camera-upload')?.click()}
                  disabled={images.length >= 4}
                >
                  <input 
                    type="file" 
                    id="camera-upload" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={images.length >= 4}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  Take Photo with Camera
                </button>
                
                {/* Upload from gallery */}
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-50" onClick={() => document.getElementById('photo-upload')?.click()}>
                  <input 
                    type="file" 
                    id="photo-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={images.length >= 4}
                  />
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">Upload from gallery</p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image preview */}
            {images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Photos ({images.length}/4)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || scannedVINs.length === 0}
                className="btn btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Save Vehicles
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-1 w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Scanned VINs</h2>
            
            {scannedVINs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-300 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                </svg>
                <p>No VINs scanned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scannedVINs.map((vin, index) => (
                  <div key={index} className="flex justify-between items-center border border-gray-200 rounded-md p-3">
                    <div>
                      <div className="font-medium">{vin}</div>
                      <div className="text-xs text-gray-500">Scanned just now</div>
                    </div>
                    <button 
                      onClick={() => removeVIN(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              Total VINs: <span className="font-medium">{scannedVINs.length}</span>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Tips for VIN Scanning
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• VINs are typically 17 characters long</li>
              <li>• VINs can be found on the driver's side dashboard</li>
              <li>• They may also be on the driver's side door jamb</li>
              <li>• Letters I, O, and Q are not used in VINs</li>
              <li>• Take clear photos of vehicle damage</li>
            </ul>
          </div>
          
          <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Vehicle Dropoff Instructions
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Mark vehicles as dropped when delivered</li>
              <li>• Use geotag to automatically record location</li>
              <li>• Manually enter address if geotag unavailable</li>
              <li>• Vehicle capacity is set by dispatch</li>
              <li>• New loads cannot be scanned until current load is dropped</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}