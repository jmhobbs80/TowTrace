import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
// Card component is used in other parts of the code
import Card from '../components/Card';
import { Vehicle, Driver } from '../types';
import useAuth from '../hooks/useAuth';

// Get window dimensions for responsive layout
const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

const FleetTracker: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const mapRef = useRef<MapView>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Load fleet data
    fetchFleetData();

    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      if (isConnected) {
        refreshFleetData();
      }
    }, 30000);

    // Cleanup function
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isConnected]);

  const fetchFleetData = async () => {
    setIsLoading(true);
    try {
      // Fetch vehicles
      const vehiclesResponse = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch drivers
      const driversResponse = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setVehicles(vehiclesResponse.data);
      setDrivers(driversResponse.data);
      
      // Calculate map region to fit all vehicles
      if (vehiclesResponse.data.length > 0) {
        const newRegion = calculateRegion(vehiclesResponse.data);
        setMapRegion(newRegion);
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion);
        }
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      Alert.alert('Error', 'Failed to load fleet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFleetData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      // Fetch vehicles
      const vehiclesResponse = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch drivers
      const driversResponse = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setVehicles(vehiclesResponse.data);
      setDrivers(driversResponse.data);
    } catch (error) {
      console.error('Error refreshing fleet data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateRegion = (vehicles: Vehicle[]) => {
    if (vehicles.length === 0) {
      return mapRegion; // Default region
    }
    
    // Calculate bounds
    let minLat = vehicles[0].latitude;
    let maxLat = vehicles[0].latitude;
    let minLng = vehicles[0].longitude;
    let maxLng = vehicles[0].longitude;
    
    vehicles.forEach(vehicle => {
      minLat = Math.min(minLat, vehicle.latitude);
      maxLat = Math.max(maxLat, vehicle.latitude);
      minLng = Math.min(minLng, vehicle.longitude);
      maxLng = Math.max(maxLng, vehicle.longitude);
    });
    
    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate deltas (with padding)
    const latDelta = (maxLat - minLat) * 1.2 + 0.02;
    const lngDelta = (maxLng - minLng) * 1.2 + 0.02;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(0.02, latDelta),
      longitudeDelta: Math.max(0.02, lngDelta),
    };
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#34C759'; // Green
      case 'idle':
        return '#007AFF'; // Blue
      case 'maintenance':
        return '#FF9500'; // Orange
      case 'out_of_service':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };

  const getDriverById = (driverId?: string) => {
    if (!driverId) return null;
    return drivers.find(driver => driver.id === driverId) || null;
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    
    // Center map on selected vehicle
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const driver = getDriverById(item.driverId);
    
    return (
      <TouchableOpacity
        style={[
          styles.vehicleItem,
          selectedVehicle?.id === item.id ? styles.selectedVehicleItem : null
        ]}
        onPress={() => handleVehicleSelect(item)}
      >
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleId}>
            Vehicle {item.id.slice(0, 6)}...
          </Text>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: getVehicleStatusColor(item.status) }
          ]} />
        </View>
        
        <View style={styles.vehicleDetails}>
          {item.vin && (
            <Text style={styles.vehicleVin}>
              VIN: {item.vin.slice(0, 8)}...
            </Text>
          )}
          
          <Text style={styles.vehicleDriver}>
            {driver ? `Driver: ${driver.name}` : 'No Driver Assigned'}
          </Text>
          
          <Text style={styles.vehicleStatus}>
            Status: {item.status}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('VINScanner')}
          >
            <Text style={styles.actionButtonText}>Scan VIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('JobAssignment', { vehicleId: item.id ?? '' })}
          >
            <Text style={styles.actionButtonText}>Assign Job</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
        >
          {vehicles.map(vehicle => (
            <Marker
              key={vehicle.id}
              coordinate={{
                latitude: vehicle.latitude,
                longitude: vehicle.longitude,
              }}
              pinColor={getVehicleStatusColor(vehicle.status)}
              onPress={() => handleVehicleSelect(vehicle)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    Vehicle {vehicle.id.slice(0, 6)}...
                  </Text>
                  <Text>Status: {vehicle.status}</Text>
                  {vehicle.vin && <Text>VIN: {vehicle.vin}</Text>}
                  {vehicle.driverId && (
                    <Text>
                      Driver: {getDriverById(vehicle.driverId)?.name || 'Unknown'}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshFleetData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Fleet Vehicles ({vehicles.length})
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('JobAssignment' as never)}
          >
            <Text style={styles.createButtonText}>+ New Job</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5856D6" />
            <Text style={styles.loadingText}>Loading fleet data...</Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderVehicleItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  No vehicles available in the fleet.
                </Text>
              </View>
            }
          />
        )}
      </View>
      
      {!isConnected && (
        <View style={styles.offlineMessage}>
          <Text style={styles.offlineText}>
            You are currently offline. Some features may be limited.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  mapContainer: {
    height: '40%',
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  createButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  vehicleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedVehicleItem: {
    borderWidth: 2,
    borderColor: '#5856D6',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  vehicleDetails: {
    marginBottom: 12,
  },
  vehicleVin: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  vehicleDriver: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  vehicleStatus: {
    fontSize: 14,
    color: '#333333',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  callout: {
    padding: 10,
    width: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  offlineMessage: {
    backgroundColor: '#FF9500',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  offlineText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FleetTracker;