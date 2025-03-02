import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { TrackingLocation } from '../types';

export default function JobTracker({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'JobTracker'>>) {
  const [location, setLocation] = useState<TrackingLocation | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queuedLocations, setQueuedLocations] = useState<TrackingLocation[]>([]);
  const [trackingPath, setTrackingPath] = useState<TrackingLocation[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [jobStatus, setJobStatus] = useState<'active' | 'paused' | 'completed'>('active');
  
  const { token } = useAuth();
  const mapRef = useRef<MapView>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const requestLocationPermission = async (): Promise<void> => {
      try {
        Geolocation.requestAuthorization();
      } catch (err: any) {
        setErrorMsg('Error requesting location permission: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    const startLocationTracking = (): void => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      
      watchIdRef.current = Geolocation.watchPosition(
        (position: GeolocationResponse) => {
          const { latitude, longitude, speed } = position.coords;
          const timestamp = new Date().toISOString();
          
          const newLocation: TrackingLocation = {
            latitude,
            longitude,
            speed: speed || 0,
            timestamp
          };
          
          setLocation(newLocation);
          setTrackingPath(prev => [...prev, newLocation]);
          
          if (isTracking) {
            sendLocationUpdate(newLocation);
          }
          
          setErrorMsg(null);
        },
        (error: any) => {
          setErrorMsg('Geolocation error: ' + error.message);
          console.error('Geolocation Error:', error);
        },
        { 
          enableHighAccuracy: true, 
          distanceFilter: 10, 
          timeout: 10000, 
          maximumAge: 1000 
        }
      );
    };

    requestLocationPermission();
    startLocationTracking();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      if (state.isConnected) {
        syncQueuedLocations();
      }
    });

    return (): void => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      unsubscribe();
    };
  }, [isTracking]);

  const sendLocationUpdate = async (locationData: TrackingLocation): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected) {
      setQueuedLocations(prev => [...prev, locationData]);
      return;
    }
    
    try {
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/update', 
        locationData, 
        {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }
      );
      console.log('Location sent:', locationData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg('API Error: ' + (error as AxiosError).message);
        console.error('Location Update Error:', {
          message: (error as AxiosError).message,
          status: (error as AxiosError).response?.status,
          data: (error as AxiosError).response?.data,
        });
      } else {
        setErrorMsg('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
        console.error('Unexpected Error:', error);
      }
      setQueuedLocations(prev => [...prev, locationData]);
    }
  };

  const syncQueuedLocations = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedLocations.length === 0) return;

    for (const queuedLocation of queuedLocations) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/update', 
          queuedLocation, 
          {
            headers: { Authorization: `Bearer ${token ?? ''}` },
          }
        );
        
        setQueuedLocations(prev => 
          prev.filter(loc => 
            loc.timestamp !== queuedLocation.timestamp)
        );
        
        console.log('Synced queued location:', queuedLocation);
      } catch (error: unknown) {
        console.error('Sync Error:', error);
        Alert.alert('Error', 'Failed to sync queued location: ' + (error instanceof Error ? error.message : String(error)));
        break; // Stop syncing if an error occurs
      }
    }
  };

  const toggleTracking = (): void => {
    setIsTracking(prev => !prev);
    if (!isTracking) {
      Alert.alert('Tracking Resumed', 'Location tracking has been resumed');
    } else {
      Alert.alert('Tracking Paused', 'Location tracking has been paused');
    }
  };

  const completeJob = async (): Promise<void> => {
    try {
      const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
      if (!isConnected) {
        Alert.alert('Error', 'Cannot complete job while offline');
        return;
      }
      
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/jobs/complete', 
        { 
          trackingPath,
          completedAt: new Date().toISOString() 
        }, 
        {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }
      );
      
      setJobStatus('completed');
      Alert.alert('Success', 'Job marked as completed', [
        {
          text: 'Continue to Inspection',
          onPress: () => navigation.navigate('Inspection')
        }
      ]);
    } catch (error: unknown) {
      console.error('Job Completion Error:', error);
      Alert.alert('Error', 'Failed to mark job as completed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>{errorMsg}</Text>
        <Button title="Try Again" onPress={() => navigation.replace('JobTracker')} />
      </View>
    );
  }
  
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading location...</Text>
      </View>
    );
  }

  const region: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        followsUserLocation
        showsCompass
        showsScale
      >
        <Marker 
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude
          }}
          title="Current Location" 
          description={`Speed: ${location.speed ? Math.round(location.speed * 2.237) : 0} mph`}
        />
        
        {trackingPath.length > 1 && (
          <Polyline
            coordinates={trackingPath.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude
            }))}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Network: {isConnected ? 'Online' : 'Offline'}
        </Text>
        <Text style={styles.statusText}>
          Tracking: {isTracking ? 'Active' : 'Paused'}
        </Text>
        {queuedLocations.length > 0 && (
          <Text style={styles.queueInfo}>
            Queued Locations: {queuedLocations.length}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, isTracking ? styles.activeButton : styles.inactiveButton]} 
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.completeButton]} 
          onPress={completeJob}
          disabled={jobStatus === 'completed'}
        >
          <Text style={styles.buttonText}>
            {jobStatus === 'completed' ? 'Job Completed' : 'Complete Job'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.inspectionButton]} 
          onPress={() => navigation.navigate('Inspection')}
        >
          <Text style={styles.buttonText}>Go to Inspection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    textAlign: 'center',
    padding: 20,
    color: 'red',
    marginBottom: 20,
  },
  statusBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
  },
  statusText: {
    marginVertical: 2,
  },
  queueInfo: {
    marginTop: 5,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF9500',
  },
  inactiveButton: {
    backgroundColor: '#34C759',
  },
  completeButton: {
    backgroundColor: '#007AFF',
  },
  inspectionButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});