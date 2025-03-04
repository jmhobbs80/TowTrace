import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Card from '../components/Card';
import { TrackingLocation } from '../types';
import useAuth from '../hooks/useAuth';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

const JobTracker: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  
  const [currentLocation, setCurrentLocation] = useState<TrackingLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<TrackingLocation[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [offlineLocations, setOfflineLocations] = useState<TrackingLocation[]>([]);
  const [activeJobInfo, setActiveJobInfo] = useState<any>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to sync offline data when connectivity returns
      if (state.isConnected && offlineLocations.length > 0) {
        syncOfflineData();
      }
    });

    // Load any offline locations from storage
    loadOfflineLocations();
    
    // Check for active jobs
    fetchActiveJob();

    // Cleanup function
    return () => {
      unsubscribe();
      if (locationWatchId !== null) {
        Geolocation.clearWatch(locationWatchId);
      }
    };
  }, []);

  const fetchActiveJob = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setActiveJobInfo(response.data);
        
        // If job has existing location history, load it
        if (response.data.locationHistory && response.data.locationHistory.length > 0) {
          setLocationHistory(response.data.locationHistory);
        }
      }
    } catch (error) {
      console.error('Error fetching active job:', error);
      // Try to load from cache if available
      try {
        const cachedJob = await AsyncStorage.getItem('activeJobCache');
        if (cachedJob) {
          setActiveJobInfo(JSON.parse(cachedJob));
        }
      } catch (cacheError) {
        console.error('Error loading cached job:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfflineLocations = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('locationTrackerOfflineData');
      if (offlineData) {
        const locations = JSON.parse(offlineData) as TrackingLocation[];
        setOfflineLocations(locations);
      }
    } catch (error) {
      console.error('Error loading offline locations:', error);
    }
  };

  const saveOfflineLocations = async (locations: TrackingLocation[]) => {
    try {
      await AsyncStorage.setItem('locationTrackerOfflineData', JSON.stringify(locations));
      setOfflineLocations(locations);
    } catch (error) {
      console.error('Error saving offline locations:', error);
    }
  };

  const syncOfflineData = async () => {
    if (offlineLocations.length === 0) return;
    
    setIsSyncing(true);
    try {
      await axios.post(
        `${API_BASE_URL}/tracking/batch`,
        { locations: offlineLocations },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Clear offline data after successful sync
      await saveOfflineLocations([]);
      
      // Refresh location history
      await fetchActiveJob();
      
      Alert.alert('Sync Complete', `${offlineLocations.length} location updates synced successfully.`);
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Failed', 'Unable to sync offline location data. Will try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const startTracking = () => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();
        const speed = position.coords.speed || 0;
        
        const newLocation: TrackingLocation = {
          latitude,
          longitude,
          timestamp,
          speed: speed * 3.6, // Convert m/s to km/h
        };
        
        setCurrentLocation(newLocation);
        setLocationHistory(prev => [...prev, newLocation]);
        
        // Send location update to server if online, otherwise store offline
        if (isConnected) {
          sendLocationUpdate(newLocation);
        } else {
          const newOfflineLocations = [...offlineLocations, newLocation];
          saveOfflineLocations(newOfflineLocations);
        }
        
        // Center map on current location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      },
      error => {
        console.error('Geolocation error:', error);
        Alert.alert('Location Error', 'Unable to track location. Please check your device settings.');
        stopTracking();
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10, // Update when moved 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000 // Fastest update interval
      }
    );
    
    setLocationWatchId(watchId);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (locationWatchId !== null) {
      Geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
    setIsTracking(false);
  };

  const sendLocationUpdate = async (location: TrackingLocation) => {
    try {
      await axios.post(
        `${API_BASE_URL}/tracking/update`,
        { location },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error sending location update:', error);
      // Add to offline queue if send fails
      const newOfflineLocations = [...offlineLocations, location];
      saveOfflineLocations(newOfflineLocations);
    }
  };

  const getInitialRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    if (locationHistory.length > 0) {
      const lastLocation = locationHistory[locationHistory.length - 1];
      return {
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    // Default region if no location available
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Job Tracker</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading job information...</Text>
          </View>
        ) : activeJobInfo ? (
          <View style={styles.jobInfoContainer}>
            <Text style={styles.jobInfoTitle}>Active Job</Text>
            <Text style={styles.jobInfoText}>
              Pickup: {activeJobInfo.pickupLocation?.address || 'Not specified'}
            </Text>
            <Text style={styles.jobInfoText}>
              Dropoff: {activeJobInfo.dropoffLocation?.address || 'Not specified'}
            </Text>
            <Text style={styles.jobInfoText}>
              Status: <Text style={styles.statusText}>{activeJobInfo.status}</Text>
            </Text>
          </View>
        ) : (
          <View style={styles.noJobContainer}>
            <Text style={styles.noJobText}>No active job assigned</Text>
          </View>
        )}
        
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={getInitialRegion()}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Current Location"
                pinColor="#007AFF"
              />
            )}
            
            {locationHistory.length > 0 && (
              <Polyline
                coordinates={locationHistory.map(loc => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#007AFF"
                strokeWidth={4}
              />
            )}
            
            {activeJobInfo?.pickupLocation && (
              <Marker
                coordinate={{
                  latitude: activeJobInfo.pickupLocation.latitude,
                  longitude: activeJobInfo.pickupLocation.longitude,
                }}
                title="Pickup Location"
                pinColor="#FF9500"
              />
            )}
            
            {activeJobInfo?.dropoffLocation && (
              <Marker
                coordinate={{
                  latitude: activeJobInfo.dropoffLocation.latitude,
                  longitude: activeJobInfo.dropoffLocation.longitude,
                }}
                title="Dropoff Location"
                pinColor="#FF3B30"
              />
            )}
          </MapView>
        </View>
        
        <View style={styles.trackingButtonContainer}>
          {isTracking ? (
            <TouchableOpacity 
              style={[styles.trackingButton, styles.stopButton]}
              onPress={stopTracking}
            >
              <Text style={styles.trackingButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.trackingButton}
              onPress={startTracking}
            >
              <Text style={styles.trackingButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Location updates will be saved locally and uploaded when connection is restored.
            </Text>
          </View>
        )}
        
        {offlineLocations.length > 0 && (
          <View style={styles.syncContainer}>
            <Text style={styles.syncText}>
              {offlineLocations.length} location updates waiting to sync
            </Text>
            {isConnected && (
              <TouchableOpacity 
                style={styles.syncButton}
                onPress={syncOfflineData}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
      
      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('VINScanner' as never)}
        >
          <Text style={styles.navigationButtonText}>VIN Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('Inspection' as never)}
        >
          <Text style={styles.navigationButtonText}>Vehicle Inspection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  jobInfoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  jobInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  jobInfoText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333333',
  },
  statusText: {
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#007AFF',
  },
  noJobContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  noJobText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  trackingButtonContainer: {
    marginBottom: 16,
  },
  trackingButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  trackingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offlineMessage: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  syncContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncText: {
    flex: 1,
    color: '#000000',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default JobTracker;