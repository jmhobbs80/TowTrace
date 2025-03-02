import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function JobTracker({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'JobTracker'>>) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queuedLocations, setQueuedLocations] = useState<{ latitude: number; longitude: number }[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const requestLocationPermission = async (): Promise<void> => {
      try {
        // Geolocation.requestAuthorization() returns void or string for iOS; handle accordingly
        Geolocation.requestAuthorization();
        // For Android, permissions are handled in AndroidManifest.xml; no need for await here
      } catch (err: any) {
        setErrorMsg('Error requesting location permission: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    requestLocationPermission();

    const watchId = Geolocation.watchPosition(
      (position: any) => { // Using 'any' temporarily; see note below for proper typing
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        sendLocationUpdate(latitude, longitude);
        setErrorMsg(null);
      },
      (error: any) => { // Using 'any' temporarily; see note below
        setErrorMsg('Geolocation error: ' + error.message);
        console.error('Geolocation Error:', error);
      },
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 10000, maximumAge: 1000 }
    );

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      if (state.isConnected) {
        syncQueuedLocations();
      }
    });

    return (): void => {
      Geolocation.clearWatch(watchId);
      unsubscribe();
    };
  }, []);

  const sendLocationUpdate = async (latitude: number, longitude: number): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected) {
      setQueuedLocations(prev => [...prev, { latitude, longitude }]);
      setErrorMsg('No internet connection. Location queued.');
      return;
    }
    try {
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/update', {
        latitude,
        longitude,
      }, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      console.log('Location sent:', { latitude, longitude });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg('API Error: ' + (error as AxiosError).message);
        console.error('Location Update Error:', {
          message: (error as AxiosError).message,
          status: (error as AxiosError).response?.status,
          data: (error as AxiosError).response?.data,
          request: (error as AxiosError).request,
          config: (error as AxiosError).config,
        });
      } else {
        setErrorMsg('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
        console.error('Unexpected Error:', error);
      }
      setQueuedLocations(prev => [...prev, { latitude, longitude }]);
    }
  };

  const syncQueuedLocations = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedLocations.length === 0) return;

    for (const queuedLocation of queuedLocations) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/update', queuedLocation, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        setQueuedLocations(prev => prev.filter(loc => loc.latitude !== queuedLocation.latitude && loc.longitude !== queuedLocation.longitude));
        console.log('Synced queued location:', queuedLocation);
      } catch (error: unknown) {
        console.error('Sync Error:', error);
        Alert.alert('Error', 'Failed to sync queued location: ' + (error instanceof Error ? error.message : String(error)));
        break; // Stop syncing if an error occurs
      }
    }
  };

  if (errorMsg) return <Text style={styles.error}>{errorMsg}</Text>;
  if (!location) return <Text>Loading location...</Text>;

  const region: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        showsUserLocation
        followsUserLocation
        onRegionChangeComplete={(region: Region) => console.log('Region changed:', region)}
      >
        <Marker coordinate={location} title="Your Location" />
      </MapView>
      <Text>Network: {isConnected ? 'Online' : 'Offline'}</Text>
      <Button title="Go to Inspection" onPress={() => navigation.navigate('Inspection')} />
      {queuedLocations.length > 0 && <Text style={styles.queueInfo}>Queued Locations: {queuedLocations.length}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    padding: 20,
    color: 'red',
  },
  queueInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 5,
    color: 'blue',
  },
});