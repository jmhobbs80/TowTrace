import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios, { AxiosResponse, AxiosError } from 'axios'; // Import AxiosResponse explicitly
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, useAuth } from '../App'; // Consolidated import, now pointing to mobile/App.tsx

export interface Vehicle {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
}

export default function FleetTracker({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'FleetTracker'>>) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queuedVehicles, setQueuedVehicles] = useState<Vehicle[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      if (state.isConnected) {
        syncQueuedVehicles();
      }
    });

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000); // Poll every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchVehicles = async (): Promise<void> => {
    const isConnectedNow = await NetInfo.fetch().then(state => state.isConnected ?? false);
    try {
      if (!isConnectedNow) {
        setErrorMsg('No internet connection. Vehicle data queued.');
        return;
      }
      const response: AxiosResponse<Vehicle[]> = await axios.get('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/vehicles', {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      setVehicles(response.data.filter(vehicle => vehicle.status === 'active')); // Fixed filter usage
      setErrorMsg(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg('API Error: ' + (error as AxiosError).message);
        console.error('Fleet Tracking Error:', {
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
      if (!isConnectedNow) {
        const offlineVehicles = ((error as AxiosError)?.response?.data as Vehicle[])?.filter((vehicle: Vehicle) => vehicle.status === 'active') || [];
        setQueuedVehicles(prev => [...prev, ...offlineVehicles]);
      }
    }
  };

  const syncQueuedVehicles = async (): Promise<void> => {
    const isConnectedNow = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnectedNow || queuedVehicles.length === 0) return;

    for (const queuedVehicle of queuedVehicles) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/tracking/vehicles/update', queuedVehicle, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        setQueuedVehicles(prev => prev.filter(v => v.id !== queuedVehicle.id));
        console.log('Synced queued vehicle:', queuedVehicle);
      } catch (error: unknown) {
        console.error('Sync Error:', error);
        Alert.alert('Error', 'Failed to sync queued vehicle: ' + (error instanceof Error ? error.message : String(error)));
        break; // Stop syncing if an error occurs
      }
    }
  };

  if (errorMsg) return <Text style={styles.error}>{errorMsg}</Text>;
  if (vehicles.length === 0) return <Text>Loading vehicles...</Text>;

  const region: Region = {
    latitude: vehicles[0].latitude,
    longitude: vehicles[0].longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        showsUserLocation
        onRegionChangeComplete={(region: Region) => console.log('Region changed:', region)}
      >
        {vehicles.map(vehicle => (
          <Marker key={vehicle.id} coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }} title={`Vehicle ${vehicle.id}`}>
            <Text>Status: {vehicle.status}</Text>
          </Marker>
        ))}
      </MapView>
      <Text>Network: {isConnected ? 'Online' : 'Offline'}</Text>
      <Button title="Assign Job" onPress={() => navigation.navigate('JobAssignment')} />
      {queuedVehicles.length > 0 && <Text style={styles.queueInfo}>Queued Vehicles: {queuedVehicles.length}</Text>}
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