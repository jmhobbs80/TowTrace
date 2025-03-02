import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeoError {
  code: number;
  message: string;
}
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'; // Import as module
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

export default function JobTracker({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'JobTracker'>>) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const requestLocationPermission = async (): Promise<void> => {
      try {
        Geolocation.requestAuthorization(); // For iOS
        // Continue with location tracking as permission is handled by the OS
      } catch (err: any) {
        setErrorMsg('Error requesting location permission: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    requestLocationPermission();

    const watchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        sendLocationUpdate(latitude, longitude);
        setErrorMsg(null);
      },
      (error: GeoError) => {
        setErrorMsg('Geolocation error: ' + error.message);
        console.error('Geolocation Error:', error);
      },
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 10000 }
    );

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
    });

    return (): void => {
      Geolocation.clearWatch(watchId);
      unsubscribe();
    };
  }, []);

  const sendLocationUpdate = async (latitude: number, longitude: number): Promise<void> => {
    if (!isConnected) {
      setErrorMsg('No internet connection');
      return;
    }
    try {
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/update', {
        latitude,
        longitude,
      });
      console.log('Location sent:', { latitude, longitude });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        setErrorMsg('API Error: ' + axiosError.message);
        console.error('Location Update Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          request: axiosError.request,
          config: axiosError.config,
        });
      } else {
        setErrorMsg('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
        console.error('Unexpected Error:', error);
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
});