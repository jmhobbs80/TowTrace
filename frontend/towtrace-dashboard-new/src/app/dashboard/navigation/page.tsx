'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/auth-context';
import Link from 'next/link';

export default function NavigationPage() {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [routeSteps, setRouteSteps] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState('');
  const [routeOptions, setRouteOptions] = useState('optimal');
  const [showTraffic, setShowTraffic] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Initialize the map
    const initMap = () => {
      if (!user || !user.currentLocation) {
        setError("Unable to determine your current location. Please enable location services.");
        setLoading(false);
        return;
      }
      
      try {
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU&libraries=places`;
        script.async = true;
        
        script.onload = () => {
          // Create map instance
          const map = new window.google.maps.Map(mapRef.current, {
            center: user.currentLocation,
            zoom: 14,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
          });
          
          setMapInstance(map);
          
          // Create traffic layer
          const traffic = new window.google.maps.TrafficLayer();
          if (showTraffic) {
            traffic.setMap(map);
          }
          setTrafficLayer(traffic);
          
          // Create directions service and renderer
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 5,
              strokeOpacity: 0.7
            }
          });
          
          setDirectionsService(directionsService);
          setDirectionsRenderer(directionsRenderer);
          
          // Set map as loaded
          setMapLoaded(true);
          setLoading(false);
          
          // Calculate route once everything is loaded
          if (user.currentLocation && (user.currentPickupLocation || user.currentDropoffLocation)) {
            calculateRoute(user, directionsService, directionsRenderer, routeOptions);
          }
        };
        
        script.onerror = () => {
          setError("Failed to load map. Please check your internet connection and try again.");
          setLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("An error occurred while initializing the map. Please try again later.");
        setLoading(false);
      }
    };
    
    initMap();
    
    return () => {
      // Cleanup function
      if (mapInstance) {
        // Clean up map resources if needed
      }
    };
  }, [user]);
  
  // Toggle traffic layer
  useEffect(() => {
    if (trafficLayer && mapInstance) {
      if (showTraffic) {
        trafficLayer.setMap(mapInstance);
      } else {
        trafficLayer.setMap(null);
      }
    }
  }, [showTraffic, trafficLayer, mapInstance]);
  
  // Calculate and display route
  const calculateRoute = (user, directionsService, directionsRenderer, routeOption = 'optimal') => {
    if (!user || !directionsService || !directionsRenderer) return;
    
    // Determine destination (pickup or dropoff)
    const destination = user.currentPickupLocation || user.currentDropoffLocation;
    
    if (!destination) {
      setError("No destination found. Please ensure you have an active job assignment.");
      return;
    }
    
    // Set route options based on user preference
    let routePreference = window.google.maps.TravelMode.DRIVING;
    let avoidHighways = false;
    let avoidTolls = false;
    
    switch (routeOption) {
      case 'fastest':
        // Default is fastest
        break;
      case 'economical':
        avoidTolls = true;
        break;
      case 'scenic':
        avoidHighways = true;
        break;
      default:
        // Default is optimal which uses AI to consider traffic
        break;
    }
    
    const request = {
      origin: user.currentLocation,
      destination: destination,
      travelMode: routePreference,
      avoidHighways: avoidHighways,
      avoidTolls: avoidTolls,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      },
      optimizeWaypoints: true
    };
    
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        
        // Get steps for turn-by-turn navigation
        const steps = route.legs[0].steps.map(step => ({
          instructions: step.instructions,
          distance: step.distance.text,
          duration: step.duration.text,
          maneuver: step.maneuver || ''
        }));
        
        setRouteSteps(steps);
        setCurrentStep(0);
        
        // Set estimated time and distance
        setEstimatedTime(route.legs[0].duration.text);
        setEstimatedDistance(route.legs[0].distance.text);
      } else {
        setError(`Could not calculate route: ${status}`);
      }
    });
  };
  
  // Start navigation
  const startNavigation = () => {
    setIsNavigating(true);
    
    // In a real app, this would activate real-time navigation with GPS updates
    // For this demo, we'll just show the turn-by-turn instructions
  };
  
  // Change route options
  const changeRouteOptions = (option) => {
    setRouteOptions(option);
    if (directionsService && directionsRenderer && user) {
      calculateRoute(user, directionsService, directionsRenderer, option);
    }
  };
  
  // Navigate to next/previous step
  const navigateStep = (direction) => {
    if (direction === 'next' && currentStep < routeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle traffic toggle
  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };
  
  // Get icon for maneuver type
  const getManeuverIcon = (maneuver) => {
    switch (maneuver) {
      case 'turn-right':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        );
      case 'turn-left':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        );
      case 'roundabout-right':
      case 'roundabout-left':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'straight':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        );
    }
  };
  
  // Get destination type
  const getDestinationType = () => {
    if (user?.currentPickupLocation && !user?.currentDropoffLocation) {
      return "Pickup";
    } else if (!user?.currentPickupLocation && user?.currentDropoffLocation) {
      return "Dropoff";
    } else if (user?.currentPickupLocation && user?.currentDropoffLocation) {
      // Determine which one is closer or which one is next in the sequence
      return "Next Stop";
    } else {
      return "Destination";
    }
  };
  
  // Get destination name
  const getDestinationName = () => {
    if (user?.currentPickupLocation && !user?.currentDropoffLocation) {
      return user.currentPickupLocation.locationName;
    } else if (!user?.currentPickupLocation && user?.currentDropoffLocation) {
      return user.currentDropoffLocation.locationName;
    } else if (user?.currentPickupLocation && user?.currentDropoffLocation) {
      // For simplicity, we'll prioritize pickup over dropoff in this example
      return user.currentPickupLocation.locationName;
    } else {
      return "Unknown Destination";
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center mb-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Destination Info */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">{getDestinationType()}</div>
            <div className="font-semibold">{getDestinationName()}</div>
            {estimatedDistance && estimatedTime && (
              <div className="text-xs text-gray-500 mt-1">
                {estimatedDistance} • Approximately {estimatedTime}
              </div>
            )}
          </div>
          
          {!isNavigating ? (
            <button 
              onClick={startNavigation}
              className="btn btn-primary btn-sm"
              disabled={loading || !mapLoaded}
            >
              Start Navigation
            </button>
          ) : (
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Navigation Active
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        {/* Map */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-2"></div>
                <div className="text-gray-500">Loading map...</div>
              </div>
            </div>
          ) : null}
          
          <div 
            ref={mapRef} 
            className="w-full h-full min-h-[400px] rounded"
            style={{ border: '1px solid #e5e7eb' }}
          ></div>
          
          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
            <button 
              onClick={toggleTraffic}
              className={`p-2 rounded-full shadow ${showTraffic ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              title={showTraffic ? 'Hide Traffic' : 'Show Traffic'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Navigation Panel */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Route Options</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => changeRouteOptions('optimal')}
                className={`px-3 py-1 text-xs rounded-full ${
                  routeOptions === 'optimal'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                AI Optimized
              </button>
              <button
                onClick={() => changeRouteOptions('fastest')}
                className={`px-3 py-1 text-xs rounded-full ${
                  routeOptions === 'fastest'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Fastest
              </button>
              <button
                onClick={() => changeRouteOptions('economical')}
                className={`px-3 py-1 text-xs rounded-full ${
                  routeOptions === 'economical'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No Tolls
              </button>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Turn-by-Turn Directions</h3>
          
          {routeSteps.length > 0 ? (
            <>
              <div className="flex-grow overflow-y-auto max-h-[300px]">
                {routeSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-3 mb-2 rounded-lg border ${
                      currentStep === index 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-700">
                        {getManeuverIcon(step.maneuver)}
                      </div>
                      <div className="flex-grow">
                        <div 
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: step.instructions }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {step.distance} • {step.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigateStep('prev')}
                  disabled={currentStep === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {routeSteps.length}
                </div>
                <button
                  onClick={() => navigateStep('next')}
                  disabled={currentStep === routeSteps.length - 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-300 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <p>No directions available yet</p>
              <p className="text-xs mt-1">Route calculation may be in progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}