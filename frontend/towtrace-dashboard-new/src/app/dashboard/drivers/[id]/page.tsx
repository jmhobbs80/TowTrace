'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { format, isBefore, addDays, parseISO } from 'date-fns';

// Define driver and job types
type Coordinates = {
  lat: number;
  lng: number;
};

type Load = {
  id: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vin: string;
  pickupLocation: string;
  pickupCoordinates: Coordinates;
  dropoffLocation: string;
  dropoffCoordinates: Coordinates;
  status: 'In Transit' | 'Pending' | 'Completed';
  customer: string;
  timeAssigned: string;
  estimatedArrival: string;
};

type DriverDocument = {
  id: string;
  documentType: string;
  title: string;
  documentNumber: string | null;
  expiryDate: string | null;
  requiresExpiry: boolean;
  imageUri: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastUpdated: string;
};

type Driver = {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'On Duty' | 'Off Duty' | 'On Break';
  location: string;
  generalLocation: string;
  coordinates: Coordinates | null;
  assignedVehicle: string;
  lastUpdate: string;
  batteryFriendly: boolean;
  activeLoads: number;
  profileImage: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  inTransitJobs: number;
  loads: Load[];
  documents: DriverDocument[];
};

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = parseInt(params.id as string);
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [selectedLoad, setSelectedLoad] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'documents'>('jobs');
  
  // Get driver data (simulated API call)
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock driver data
        const mockDriver: Driver = {
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
          activeLoads: 2,
          profileImage: "https://i.pravatar.cc/300?img=12",
          rating: 4.8,
          totalJobs: 145,
          completedJobs: 137,
          pendingJobs: 3,
          inTransitJobs: 5,
          documents: [
            {
              id: "doc1",
              documentType: "license",
              title: "Driver License",
              documentNumber: "DL12345678",
              expiryDate: "2025-06-15T00:00:00Z",
              requiresExpiry: true,
              imageUri: "https://example.com/license.jpg",
              syncStatus: "synced",
              lastUpdated: "2025-01-10T09:30:00Z"
            },
            {
              id: "doc2",
              documentType: "medical",
              title: "Medical Card",
              documentNumber: "MC98765432",
              expiryDate: "2025-04-20T00:00:00Z",
              requiresExpiry: true,
              imageUri: "https://example.com/medical.jpg",
              syncStatus: "synced", 
              lastUpdated: "2025-01-15T14:20:00Z"
            },
            {
              id: "doc3",
              documentType: "dot_card",
              title: "DOT Card",
              documentNumber: "DOT3456789",
              expiryDate: "2025-03-10T00:00:00Z",
              requiresExpiry: true,
              imageUri: "https://example.com/dot.jpg",
              syncStatus: "synced",
              lastUpdated: "2025-01-05T11:15:00Z"
            }
          ],
          loads: [
            {
              id: 1,
              vehicleMake: "Toyota",
              vehicleModel: "Camry",
              vehicleYear: "2019",
              vin: "4T1BF1FK5HU123456",
              pickupLocation: "245 E Washington St, Phoenix, AZ",
              pickupCoordinates: { lat: 33.4484, lng: -112.0740 },
              dropoffLocation: "2100 S 7th St, Phoenix, AZ",
              dropoffCoordinates: { lat: 33.4200, lng: -112.0695 },
              status: "In Transit",
              customer: "ABC Auto Company",
              timeAssigned: "Today, 9:30 AM",
              estimatedArrival: "Today, 2:30 PM"
            },
            {
              id: 2,
              vehicleMake: "Honda",
              vehicleModel: "Civic",
              vehicleYear: "2020",
              vin: "19XFC2F53NE789012",
              pickupLocation: "112 N Central Ave, Phoenix, AZ",
              pickupCoordinates: { lat: 33.4491, lng: -112.0738 },
              dropoffLocation: "4600 E McDowell Rd, Phoenix, AZ",
              dropoffCoordinates: { lat: 33.4660, lng: -111.9839 },
              status: "Pending",
              customer: "XYZ Motors",
              timeAssigned: "Today, 10:15 AM",
              estimatedArrival: "Today, 4:45 PM"
            }
          ]
        };
        
        // If we have an ID that's not 1, use mock drivers with that ID
        if (driverId === 3) {
          mockDriver.id = 3;
          mockDriver.name = "Michael Brown";
          mockDriver.phone = "(555) 456-7890";
          mockDriver.email = "m.brown@example.com";
          mockDriver.status = "On Duty";
          mockDriver.location = "North Scottsdale";
          mockDriver.generalLocation = "Scottsdale Area";
          mockDriver.coordinates = { lat: 33.6695, lng: -111.9235 };
          mockDriver.assignedVehicle = "Tesla Model S";
          mockDriver.lastUpdate = "5 minutes ago";
        } else if (driverId === 4) {
          mockDriver.id = 4;
          mockDriver.name = "Emily Davis";
          mockDriver.phone = "(555) 789-0123";
          mockDriver.email = "emily.d@example.com";
          mockDriver.status = "On Break";
          mockDriver.location = "Tempe";
          mockDriver.generalLocation = "Tempe Area";
          mockDriver.coordinates = { lat: 33.4255, lng: -111.9400 };
          mockDriver.assignedVehicle = "Chevrolet Malibu";
          mockDriver.lastUpdate = "45 minutes ago";
          mockDriver.activeLoads = 3;
          mockDriver.loads = [
            {
              id: 3,
              vehicleMake: "Nissan",
              vehicleModel: "Altima",
              vehicleYear: "2021",
              vin: "1N4BL4EV5XC345678",
              pickupLocation: "1200 S Priest Dr, Tempe, AZ",
              pickupCoordinates: { lat: 33.4240, lng: -111.9400 },
              dropoffLocation: "1000 E Apache Blvd, Tempe, AZ",
              dropoffCoordinates: { lat: 33.4150, lng: -111.9320 },
              status: "In Transit",
              customer: "Tempe Auto Sales",
              timeAssigned: "Today, 11:30 AM",
              estimatedArrival: "Today, 3:30 PM"
            },
            {
              id: 4,
              vehicleMake: "Ford",
              vehicleModel: "Focus",
              vehicleYear: "2018",
              vin: "1FADP3K29JL901234",
              pickupLocation: "48 S Mill Ave, Tempe, AZ",
              pickupCoordinates: { lat: 33.4295, lng: -111.9400 },
              dropoffLocation: "1375 E University Dr, Tempe, AZ",
              dropoffCoordinates: { lat: 33.4222, lng: -111.9210 },
              status: "Pending",
              customer: "Desert Motors",
              timeAssigned: "Today, 12:45 PM",
              estimatedArrival: "Today, 5:15 PM"
            },
            {
              id: 5,
              vehicleMake: "Chevrolet",
              vehicleModel: "Malibu",
              vehicleYear: "2017",
              vin: "1G1ZE5SX9HF123456",
              pickupLocation: "323 S Martin Ln, Tempe, AZ",
              pickupCoordinates: { lat: 33.4272, lng: -111.9350 },
              dropoffLocation: "3333 S Rural Rd, Tempe, AZ",
              dropoffCoordinates: { lat: 33.3890, lng: -111.9285 },
              status: "Pending",
              customer: "Sun State Auto",
              timeAssigned: "Today, 1:30 PM",
              estimatedArrival: "Today, 6:00 PM"
            }
          ];
        }
        
        setDriver(mockDriver);
      } catch (err) {
        console.error('Error fetching driver:', err);
        setError('Failed to load driver information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriver();
  }, [driverId]);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!driver || !driver.coordinates || mapLoaded || !showMap) return;
    
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    const loadGoogleMaps = () => {
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps) {
        try {
          const map = new window.google.maps.Map(mapDiv, {
            center: driver.coordinates,
            zoom: 13,
            mapTypeControl: false, // Simplify UI
            streetViewControl: false, // Disable Street View
            fullscreenControl: false, // Disable fullscreen
          });
          
          setMapInstance(map);
          setMapLoaded(true);
        } catch (err) {
          console.error('Error initializing map:', err);
          setError('Failed to initialize map. Please try refreshing the page.');
        }
        return;
      }
      
      // If not loaded, load the Google Maps API
      try {
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        
        // If there's already a Google Maps script tag, don't add another one
        if (existingScript) {
          console.log('Google Maps script already exists, waiting for it to load');
          
          // Set a timeout to check if Google Maps is available after a delay
          setTimeout(() => {
            if (window.google && window.google.maps) {
              try {
                const map = new window.google.maps.Map(mapDiv, {
                  center: driver.coordinates,
                  zoom: 13,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                });
                
                setMapInstance(map);
                setMapLoaded(true);
              } catch (err) {
                console.error('Error initializing map after timeout:', err);
                setError('Failed to initialize map. Please try refreshing the page.');
              }
            } else {
              console.error('Google Maps not available after timeout');
              setError('Failed to load Google Maps. Please try refreshing the page.');
            }
          }, 2000);
          
          return;
        }
        
        // Create a new script tag if one doesn't exist
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          try {
            const map = new window.google.maps.Map(mapDiv, {
              center: driver.coordinates,
              zoom: 13,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            });
            
            setMapInstance(map);
            setMapLoaded(true);
          } catch (err) {
            console.error('Error initializing map on script load:', err);
            setError('Failed to initialize map. Please try refreshing the page.');
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          setError('Failed to load map. Please try refreshing the page.');
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please try refreshing the page.');
      }
    };
    
    loadGoogleMaps();
    
    // Cleanup function to cancel any pending operations
    return () => {
      // If we have a map instance, let's clean it up
      if (mapInstance) {
        // Clear markers
        if (markers && markers.length > 0) {
          markers.forEach(marker => {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          });
        }
        setMarkers([]);
      }
    };
  }, [driver, mapLoaded, showMap, mapInstance, markers]);
  
  // Add markers to the map
  useEffect(() => {
    // Only add markers if map is loaded, instance exists, driver data exists, and map is shown
    if (!mapLoaded || !mapInstance || !driver || !showMap) return;
    
    // Use a timeout to ensure the map is fully rendered before adding markers
    const markersTimeout = setTimeout(() => {
      try {
        // Clear existing markers
        if (markers && markers.length > 0) {
          markers.forEach(marker => {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          });
        }
        
        const newMarkers = [];
        
        // Add driver marker first - just a simple marker without complex icons
        if (driver.coordinates) {
          try {
            const driverMarker = new window.google.maps.Marker({
              position: driver.coordinates,
              map: mapInstance,
              // Use simpler standard marker with custom color instead of complex path
              icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              title: `Driver: ${driver.name}`,
            });
            
            newMarkers.push(driverMarker);
          } catch (error) {
            console.error('Error creating driver marker:', error);
          }
        }
        
        // Add load markers only if there are any and selectedLoad matches
        if (driver.loads && driver.loads.length > 0) {
          // Only process one load to reduce complexity
          const loadToShow = selectedLoad 
            ? driver.loads.find(l => l.id === selectedLoad) 
            : driver.loads[0];
          
          if (loadToShow) {
            try {
              // Pickup location
              if (loadToShow.pickupCoordinates) {
                const pickupMarker = new window.google.maps.Marker({
                  position: loadToShow.pickupCoordinates,
                  map: mapInstance,
                  icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  title: `Pickup: ${loadToShow.pickupLocation}`,
                });
                
                newMarkers.push(pickupMarker);
              }
              
              // Dropoff location
              if (loadToShow.dropoffCoordinates) {
                const dropoffMarker = new window.google.maps.Marker({
                  position: loadToShow.dropoffCoordinates,
                  map: mapInstance,
                  icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  title: `Dropoff: ${loadToShow.dropoffLocation}`,
                });
                
                newMarkers.push(dropoffMarker);
              }
              
              // Add simple line between pickup and dropoff
              if (loadToShow.pickupCoordinates && loadToShow.dropoffCoordinates) {
                const routePath = new window.google.maps.Polyline({
                  path: [loadToShow.pickupCoordinates, loadToShow.dropoffCoordinates],
                  geodesic: true,
                  strokeColor: '#4F46E5',
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                });
                
                routePath.setMap(mapInstance);
                newMarkers.push(routePath);
              }
            } catch (error) {
              console.error('Error creating load markers:', error);
            }
          }
        }
        
        setMarkers(newMarkers);
      } catch (error) {
        console.error('Error in marker creation:', error);
        setError('There was a problem loading the map. Please try refreshing the page.');
      }
    }, 500); // Small delay to ensure map is ready
    
    // Cleanup function to cancel the timeout and clear markers if component unmounts
    return () => {
      clearTimeout(markersTimeout);
    };
  }, [driver, mapLoaded, mapInstance, selectedLoad, showMap, markers]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !driver) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error || "Driver not found"}
            </p>
          </div>
        </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Driver Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={driver.profileImage}
                    alt={driver.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                  driver.status === 'On Duty' 
                    ? 'bg-green-500' 
                    : driver.status === 'Off Duty' 
                    ? 'bg-gray-500' 
                    : 'bg-yellow-500'
                }`}></span>
              </div>
              
              <h2 className="text-xl font-semibold mt-4">{driver.name}</h2>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  driver.status === 'On Duty' 
                    ? 'bg-green-100 text-green-800' 
                    : driver.status === 'Off Duty' 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {driver.status}
                </span>
                {driver.batteryFriendly && driver.status !== 'Off Duty' && (
                  <span className="ml-2 text-xs text-green-600 flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    GPS Active
                  </span>
                )}
              </div>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">Current Location</div>
                    <div className="text-sm text-gray-600">{driver.location || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">Assigned Vehicle</div>
                    <div className="text-sm text-gray-600">{driver.assignedVehicle}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">Phone</div>
                    <div className="text-sm text-gray-600">{driver.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">Email</div>
                    <div className="text-sm text-gray-600">{driver.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">Last Update</div>
                    <div className="text-sm text-gray-600">{driver.lastUpdate}</div>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-700 font-medium">Total Jobs</div>
                    <div className="text-2xl font-bold text-blue-800">{driver.totalJobs}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-700 font-medium">Completed</div>
                    <div className="text-2xl font-bold text-green-800">{driver.completedJobs}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-yellow-700 font-medium">Pending</div>
                    <div className="text-2xl font-bold text-yellow-800">{driver.pendingJobs}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-700 font-medium">In Transit</div>
                    <div className="text-2xl font-bold text-purple-800">{driver.inTransitJobs}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-5 h-5 ${star <= Math.floor(driver.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{driver.rating} / 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Live Location Tracking</h2>
              <button 
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                {showMap ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    Hide Map
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Show Map
                  </>
                )}
              </button>
            </div>
            
            {showMap ? (
              <>
                <div 
                  id="map" 
                  className="w-full h-[400px] bg-gray-100 rounded-lg"
                  style={{ border: '1px solid #e5e7eb' }}
                ></div>
                
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <div className="flex items-center mr-4">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                    <span>Driver</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span>Pickup</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                    <span>Dropoff</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">Map is currently hidden. Click "Show Map" to view the driver's live location.</p>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              {driver.batteryFriendly && driver.status !== 'Off Duty' ? (
                <div className="flex items-center text-green-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                  <span>Battery-friendly GPS tracking active (updates location every 5 minutes)</span>
                </div>
              ) : (
                <div>GPS tracking is currently {driver.status === 'Off Duty' ? 'inactive while driver is off duty' : 'disabled'}</div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex border-b border-gray-200 mb-4">
              <button 
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'jobs' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('jobs')}
              >
                Current Loads ({driver.loads.length})
              </button>
              <button 
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'documents' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents ({driver.documents.length})
              </button>
            </div>
            
            {activeTab === 'jobs' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Current Loads</h2>
                  <div>
                    <Link href="/dashboard/jobs/new" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Assign New Load
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {driver.loads.map((load) => (
                    <div 
                      key={load.id} 
                      className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                        selectedLoad === load.id 
                          ? 'border-primary-500 shadow-md' 
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => setSelectedLoad(load.id)}
                    >
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 flex justify-between items-center">
                        <div className="font-medium">{load.vehicleYear} {load.vehicleMake} {load.vehicleModel}</div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          load.status === 'In Transit' 
                            ? 'bg-blue-100 text-blue-800' 
                            : load.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {load.status}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">VIN</div>
                            <div className="text-sm font-mono">{load.vin}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Customer</div>
                            <div className="text-sm">{load.customer}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start mb-3">
                          <div className="mt-1 flex-shrink-0">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-green-500 bg-white text-xs font-medium text-green-500">P</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">Pickup</div>
                            <div className="text-sm text-gray-600">{load.pickupLocation}</div>
                          </div>
                        </div>
                        
                        <div className="ml-2 pl-2 border-l-2 border-dashed border-gray-300 h-6"></div>
                        
                        <div className="flex items-start">
                          <div className="mt-1 flex-shrink-0">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 bg-white text-xs font-medium text-red-500">D</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">Dropoff</div>
                            <div className="text-sm text-gray-600">{load.dropoffLocation}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between text-sm text-gray-500">
                          <div>Assigned: {load.timeAssigned}</div>
                          <div>ETA: {load.estimatedArrival}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {driver.loads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-300 mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <p>No active loads assigned to this driver</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'documents' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Driver Documents</h2>
                  <div>
                    <Link 
                      href={`/dashboard/drivers/edit/${driver.id}?tab=documents`}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Upload New Document
                    </Link>
                  </div>
                </div>
                
                {driver.documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p>No documents found for this driver</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID Number
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expiry Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {driver.documents.map((document) => {
                          const expiryDate = document.expiryDate ? parseISO(document.expiryDate) : null;
                          let status = 'valid';
                          if (expiryDate) {
                            const today = new Date();
                            const thirtyDaysFromNow = addDays(today, 30);
                            
                            if (isBefore(expiryDate, today)) {
                              status = 'expired';
                            } else if (isBefore(expiryDate, thirtyDaysFromNow)) {
                              status = 'expiringSoon';
                            }
                          }
                          
                          const statusClasses = status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : status === 'expiringSoon'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800';
                            
                          return (
                            <tr key={document.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{document.title}</div>
                                <div className="text-xs text-gray-500">{document.documentType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{document.documentNumber || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {expiryDate ? format(expiryDate, 'MM/dd/yyyy') : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
                                  {status === 'valid' ? 'Valid' : status === 'expiringSoon' ? 'Expiring Soon' : 'Expired'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => window.open(document.imageUri, '_blank')}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    View
                                  </button>
                                  {status !== 'valid' && (
                                    <button
                                      onClick={() => {
                                        // Send reminder logic would go here
                                        alert('Reminder sent to driver about document expiration');
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Send Reminder
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}