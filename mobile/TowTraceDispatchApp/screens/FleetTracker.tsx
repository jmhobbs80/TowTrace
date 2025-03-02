import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios, { AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList, Vehicle } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FleetTracker'>;

export default function FleetTracker({ navigation }: Readonly<Props>) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchVehicles();

    // Set up 30-second refresh interval for real-time tracking
    const intervalId = setInterval(() => {
      fetchVehicles(false); // Silent refresh (no loading indicator)
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchVehicles = async (showLoading = true): Promise<void> => {
    if (showLoading) setIsLoading(true);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    
    if (!isConnected) {
      if (showLoading) setIsLoading(false);
      Alert.alert("Offline", "Cannot fetch vehicle locations while offline.");
      return;
    }

    try {
      const response = await axios.get(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/fleet/vehicles',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setVehicles(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Vehicle Fetch Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to fetch vehicles: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to fetch vehicles: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      if (showLoading) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchVehicles();
  };

  const handleVehicleSelect = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
  };

  const assignJob = (vehicleId: string): void => {
    // Navigate to job assignment screen with the selected vehicle
    navigation.navigate('JobAssignment', { vehicleId });
  };

  // Calculate map region to fit all vehicles
  const getMapRegion = () => {
    if (vehicles.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = vehicles.map(v => v.latitude);
    const longitudes = vehicles.map(v => v.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    
    // Add padding
    const latDelta = (maxLat - minLat) * 1.5 || 0.0922;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.0421;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.0922),
      longitudeDelta: Math.max(lngDelta, 0.0421),
    };
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fleet data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsTraffic={true}
        >
          {vehicles.map(vehicle => (
            <Marker
              key={vehicle.id}
              coordinate={{
                latitude: vehicle.latitude,
                longitude: vehicle.longitude,
              }}
              title={vehicle.vin ? `Vehicle ${vehicle.vin.slice(-6)}` : `Vehicle ${vehicle.id}`}
              description={`Status: ${vehicle.status}`}
              pinColor={vehicle.status === 'available' ? 'green' : vehicle.status === 'in_use' ? 'red' : 'orange'}
              onPress={() => handleVehicleSelect(vehicle)}
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {vehicle.vin ? `VIN: ${vehicle.vin.slice(-6)}` : `Vehicle ${vehicle.id}`}
                  </Text>
                  <Text>Status: {vehicle.status}</Text>
                  <TouchableOpacity
                    style={styles.calloutButton}
                    onPress={() => assignJob(vehicle.id)}
                  >
                    <Text style={styles.calloutButtonText}>Assign Job</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Vehicle Fleet ({vehicles.length})</Text>
        <ScrollView
          style={styles.vehicleList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {vehicles.length === 0 ? (
            <Text style={styles.emptyText}>No vehicles available</Text>
          ) : (
            vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleItem,
                  selectedVehicle?.id === vehicle.id && styles.selectedVehicle,
                ]}
                onPress={() => handleVehicleSelect(vehicle)}
              >
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleTitle}>
                    {vehicle.vin ? `VIN: ${vehicle.vin.slice(-6)}` : `Vehicle ${vehicle.id}`}
                  </Text>
                  <Text>Status: {vehicle.status}</Text>
                </View>
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => assignJob(vehicle.id)}
                >
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    margin: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    padding: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  vehicleList: {
    flex: 1,
  },
  vehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedVehicle: {
    backgroundColor: '#e6f0ff',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  assignButton: {
    backgroundColor: '#4287f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  assignButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  calloutContainer: {
    width: 200,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutButton: {
    backgroundColor: '#4287f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});