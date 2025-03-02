import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import axios, { AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList, Driver, Vehicle, Job } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'JobAssignment'>;

export default function JobAssignment({ route, navigation }: Readonly<Props>) {
  // Parameters can be passed when navigating to this screen
  const vehicleId = route.params?.vehicleId;

  const [job, setJob] = useState<Partial<Job>>({
    pickupLocation: {
      latitude: 37.78825,
      longitude: -122.4324,
      address: '',
    },
    dropoffLocation: {
      latitude: 37.79825,
      longitude: -122.4424,
      address: '',
    },
    status: 'pending',
    stops: [],
  });

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [queuedJobs, setQueuedJobs] = useState<Partial<Job>[]>([]);
  const [stopAddress, setStopAddress] = useState<string>('');
  const [stopLatitude, setStopLatitude] = useState<string>('');
  const [stopLongitude, setStopLongitude] = useState<string>('');

  const { token } = useAuth();

  useEffect(() => {
    loadData();

    // Set up netinfo listener to try to send queued jobs when back online
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && queuedJobs.length > 0) {
        syncQueuedJobs();
      }
    });

    return () => unsubscribe();
  }, []);

  // If a vehicleId was passed, find and select that vehicle
  useEffect(() => {
    if (vehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setJob(prev => ({ ...prev, vehicleId: vehicle.id }));
      }
    }
  }, [vehicleId, vehicles]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    
    if (!isConnected) {
      setIsLoading(false);
      Alert.alert("Offline", "Cannot load dispatcher data while offline.");
      return;
    }

    try {
      // Fetch drivers and vehicles in parallel
      const [driversResponse, vehiclesResponse] = await Promise.all([
        axios.get('https://towtrace-api.justin-michael-hobbs.workers.dev/drivers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('https://towtrace-api.justin-michael-hobbs.workers.dev/fleet/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      setDrivers(driversResponse.data);
      setVehicles(vehiclesResponse.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Data Fetch Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to fetch data: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to fetch data: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverSelect = (driver: Driver): void => {
    setSelectedDriver(driver);
    setJob(prev => ({ ...prev, driverId: driver.id }));
  };

  const handleVehicleSelect = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
    setJob(prev => ({ ...prev, vehicleId: vehicle.id }));
  };

  const handleAddStop = (): void => {
    if (!stopAddress || !stopLatitude || !stopLongitude) {
      Alert.alert('Missing Information', 'Please fill in all stop fields.');
      return;
    }

    const lat = parseFloat(stopLatitude);
    const lng = parseFloat(stopLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude.');
      return;
    }

    const newStop = {
      latitude: lat,
      longitude: lng,
      address: stopAddress,
      orderId: (job.stops?.length || 0) + 1,
    };

    setJob(prev => ({
      ...prev,
      stops: [...(prev.stops || []), newStop],
    }));

    // Clear input fields
    setStopAddress('');
    setStopLatitude('');
    setStopLongitude('');
  };

  const handleRemoveStop = (orderId: number): void => {
    setJob(prev => ({
      ...prev,
      stops: prev.stops?.filter(stop => stop.orderId !== orderId) || [],
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!job.driverId) {
      Alert.alert('Missing Information', 'Please select a driver.');
      return;
    }

    if (!job.vehicleId) {
      Alert.alert('Missing Information', 'Please select a vehicle.');
      return;
    }

    if (!job.pickupLocation?.address) {
      Alert.alert('Missing Information', 'Please enter a pickup address.');
      return;
    }

    if (!job.dropoffLocation?.address) {
      Alert.alert('Missing Information', 'Please enter a dropoff address.');
      return;
    }

    setIsSaving(true);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);

    try {
      if (!isConnected) {
        setQueuedJobs(prev => [...prev, job]);
        Alert.alert('Offline', 'Job has been queued and will be submitted when online.');
        setIsSaving(false);
        navigation.navigate('FleetTracker');
        return;
      }

      await axios.post(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/jobs',
        job,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Job assigned successfully!');
      
      // Reset form
      setSelectedDriver(null);
      setSelectedVehicle(null);
      setJob({
        pickupLocation: {
          latitude: 37.78825,
          longitude: -122.4324,
          address: '',
        },
        dropoffLocation: {
          latitude: 37.79825,
          longitude: -122.4424,
          address: '',
        },
        status: 'pending',
        stops: [],
      });

      // Navigate back to fleet tracker
      navigation.navigate('FleetTracker');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Job Assignment Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to assign job: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to assign job: ' + (error instanceof Error ? error.message : String(error)));
      }

      // Queue job if we get an error
      if (!isConnected) {
        setQueuedJobs(prev => [...prev, job]);
        Alert.alert('Offline', 'Job has been queued and will be submitted when online.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const syncQueuedJobs = async (): Promise<void> => {
    if (queuedJobs.length === 0) return;

    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected) return;

    for (const queuedJob of queuedJobs) {
      try {
        await axios.post(
          'https://towtrace-api.justin-michael-hobbs.workers.dev/jobs',
          queuedJob,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setQueuedJobs(prev => prev.filter(j => j !== queuedJob));
        Alert.alert('Sync Success', 'Queued job has been submitted.');
      } catch (error: unknown) {
        console.error('Job Sync Error:', error);
        break; // Stop syncing if we encounter an error
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading job assignment data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Driver Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Driver</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectList}
          >
            {drivers.map(driver => (
              <TouchableOpacity
                key={driver.id}
                style={[
                  styles.selectItem,
                  selectedDriver?.id === driver.id && styles.selectedItem,
                  driver.status === 'offline' && styles.disabledItem,
                ]}
                onPress={() => handleDriverSelect(driver)}
                disabled={driver.status === 'offline'}
              >
                <Text style={styles.selectItemTitle}>{driver.name}</Text>
                <Text style={[
                  styles.statusText,
                  driver.status === 'available' && styles.availableStatus,
                  driver.status === 'busy' && styles.busyStatus,
                  driver.status === 'offline' && styles.offlineStatus,
                ]}>
                  {driver.status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectList}
          >
            {vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.selectItem,
                  selectedVehicle?.id === vehicle.id && styles.selectedItem,
                  vehicle.status === 'in_use' && styles.disabledItem,
                ]}
                onPress={() => handleVehicleSelect(vehicle)}
                disabled={vehicle.status === 'in_use'}
              >
                <Text style={styles.selectItemTitle}>
                  {vehicle.vin ? `VIN: ${vehicle.vin.slice(-6)}` : `Vehicle ${vehicle.id}`}
                </Text>
                <Text style={[
                  styles.statusText,
                  vehicle.status === 'available' && styles.availableStatus,
                  vehicle.status === 'in_use' && styles.busyStatus,
                ]}>
                  {vehicle.status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Location Entry Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          
          {/* Pickup Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              value={job.pickupLocation?.address}
              onChangeText={(text) => setJob(prev => ({
                ...prev,
                pickupLocation: { ...prev.pickupLocation!, address: text }
              }))}
            />
            <View style={styles.coordInputRow}>
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Latitude"
                keyboardType="numeric"
                value={job.pickupLocation?.latitude.toString()}
                onChangeText={(text) => {
                  const lat = parseFloat(text);
                  if (!isNaN(lat)) {
                    setJob(prev => ({
                      ...prev,
                      pickupLocation: { ...prev.pickupLocation!, latitude: lat }
                    }));
                  }
                }}
              />
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Longitude"
                keyboardType="numeric"
                value={job.pickupLocation?.longitude.toString()}
                onChangeText={(text) => {
                  const lng = parseFloat(text);
                  if (!isNaN(lng)) {
                    setJob(prev => ({
                      ...prev,
                      pickupLocation: { ...prev.pickupLocation!, longitude: lng }
                    }));
                  }
                }}
              />
            </View>
          </View>

          {/* Dropoff Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dropoff Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Dropoff Address"
              value={job.dropoffLocation?.address}
              onChangeText={(text) => setJob(prev => ({
                ...prev,
                dropoffLocation: { ...prev.dropoffLocation!, address: text }
              }))}
            />
            <View style={styles.coordInputRow}>
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Latitude"
                keyboardType="numeric"
                value={job.dropoffLocation?.latitude.toString()}
                onChangeText={(text) => {
                  const lat = parseFloat(text);
                  if (!isNaN(lat)) {
                    setJob(prev => ({
                      ...prev,
                      dropoffLocation: { ...prev.dropoffLocation!, latitude: lat }
                    }));
                  }
                }}
              />
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Longitude"
                keyboardType="numeric"
                value={job.dropoffLocation?.longitude.toString()}
                onChangeText={(text) => {
                  const lng = parseFloat(text);
                  if (!isNaN(lng)) {
                    setJob(prev => ({
                      ...prev,
                      dropoffLocation: { ...prev.dropoffLocation!, longitude: lng }
                    }));
                  }
                }}
              />
            </View>
          </View>

          {/* Additional Stops */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Stops (Optional)</Text>
            
            {/* Add stop form */}
            <TextInput
              style={styles.input}
              placeholder="Stop Address"
              value={stopAddress}
              onChangeText={setStopAddress}
            />
            <View style={styles.coordInputRow}>
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Latitude"
                keyboardType="numeric"
                value={stopLatitude}
                onChangeText={setStopLatitude}
              />
              <TextInput
                style={[styles.input, styles.coordInput]}
                placeholder="Longitude"
                keyboardType="numeric"
                value={stopLongitude}
                onChangeText={setStopLongitude}
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddStop}
            >
              <Text style={styles.addButtonText}>Add Stop</Text>
            </TouchableOpacity>

            {/* List of added stops */}
            {job.stops && job.stops.length > 0 && (
              <View style={styles.stopsList}>
                <Text style={styles.stopsListTitle}>Added Stops ({job.stops.length})</Text>
                {job.stops.map((stop) => (
                  <View key={stop.orderId} style={styles.stopItem}>
                    <View style={styles.stopInfo}>
                      <Text style={styles.stopTitle}>Stop {stop.orderId}: {stop.address}</Text>
                      <Text style={styles.stopCoords}>
                        {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveStop(stop.orderId)}
                    >
                      <Text style={styles.removeButtonText}></Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Route Map Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Preview</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: job.pickupLocation?.latitude || 37.78825,
                longitude: job.pickupLocation?.longitude || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {/* Pickup marker */}
              {job.pickupLocation && (
                <Marker
                  coordinate={{
                    latitude: job.pickupLocation.latitude,
                    longitude: job.pickupLocation.longitude,
                  }}
                  title="Pickup"
                  description={job.pickupLocation.address}
                  pinColor="green"
                />
              )}

              {/* Stop markers */}
              {job.stops?.map((stop) => (
                <Marker
                  key={stop.orderId}
                  coordinate={{
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                  }}
                  title={`Stop ${stop.orderId}`}
                  description={stop.address}
                  pinColor="blue"
                />
              ))}

              {/* Dropoff marker */}
              {job.dropoffLocation && (
                <Marker
                  coordinate={{
                    latitude: job.dropoffLocation.latitude,
                    longitude: job.dropoffLocation.longitude,
                  }}
                  title="Dropoff"
                  description={job.dropoffLocation.address}
                  pinColor="red"
                />
              )}
            </MapView>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Assign Job</Text>
          )}
        </TouchableOpacity>

        {queuedJobs.length > 0 && (
          <Text style={styles.queuedMessage}>
            {queuedJobs.length} job(s) queued for submission
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  selectItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minWidth: 100,
  },
  selectedItem: {
    backgroundColor: '#e6f0ff',
    borderWidth: 2,
    borderColor: '#4287f5',
  },
  disabledItem: {
    opacity: 0.6,
  },
  selectItemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  availableStatus: {
    color: 'green',
  },
  busyStatus: {
    color: 'orange',
  },
  offlineStatus: {
    color: 'red',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  coordInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#4287f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stopsList: {
    marginTop: 16,
  },
  stopsListTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stopInfo: {
    flex: 1,
  },
  stopTitle: {
    fontWeight: 'bold',
  },
  stopCoords: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  submitButton: {
    backgroundColor: '#4287f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  queuedMessage: {
    textAlign: 'center',
    color: 'orange',
    marginBottom: 24,
  },
});