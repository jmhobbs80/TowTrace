import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import { Job, Driver, Vehicle } from '../types';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

interface Stop {
  address: string;
  latitude: number;
  longitude: number;
  orderId: number;
}

const JobAssignment: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  
  const [jobForm, setJobForm] = useState<{
    driverId?: string;
    vehicleId?: string;
    pickupAddress: string;
    pickupLatitude: string;
    pickupLongitude: string;
    dropoffAddress: string;
    dropoffLatitude: string;
    dropoffLongitude: string;
    stops: Stop[];
  }>({
    driverId: undefined,
    vehicleId: undefined,
    pickupAddress: '',
    pickupLatitude: '',
    pickupLongitude: '',
    dropoffAddress: '',
    dropoffLatitude: '',
    dropoffLongitude: '',
    stops: []
  });
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Jobs are used for reference but currently not displayed directly
  const [, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [offlineJobs, setOfflineJobs] = useState<any[]>([]);
  const [showDriversModal, setShowDriversModal] = useState<boolean>(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState<boolean>(false);
  // Stop index tracking will be used in future implementation
  const [currentStopIndex] = useState<number | null>(null);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to sync offline data when connectivity returns
      if (state.isConnected && offlineJobs.length > 0) {
        syncOfflineJobs();
      }
    });

    // Load necessary data
    fetchData();
    loadOfflineJobs();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch drivers
      const driversResponse = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch vehicles
      const vehiclesResponse = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch jobs
      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDrivers(driversResponse.data);
      setVehicles(vehiclesResponse.data);
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfflineJobs = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('offlineJobs');
      if (offlineData) {
        const jobs = JSON.parse(offlineData);
        setOfflineJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading offline jobs:', error);
    }
  };

  const saveOfflineJob = async (jobData: any) => {
    try {
      const newOfflineJobs = [...offlineJobs, jobData];
      await AsyncStorage.setItem('offlineJobs', JSON.stringify(newOfflineJobs));
      setOfflineJobs(newOfflineJobs);
    } catch (error) {
      console.error('Error saving offline job:', error);
    }
  };

  const syncOfflineJobs = async () => {
    if (offlineJobs.length === 0) return;
    
    setIsSubmitting(true);
    try {
      for (const job of offlineJobs) {
        try {
          await axios.post(
            `${API_BASE_URL}/jobs`,
            job,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (error) {
          console.error('Error syncing job:', error);
        }
      }
      
      // Clear offline jobs
      await AsyncStorage.setItem('offlineJobs', JSON.stringify([]));
      setOfflineJobs([]);
      
      // Refresh jobs list
      fetchData();
      
      Alert.alert('Sync Complete', 'Offline jobs have been uploaded successfully.');
    } catch (error) {
      console.error('Error syncing offline jobs:', error);
      Alert.alert('Sync Error', 'Some jobs could not be synced. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: string | undefined) => {
    setJobForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStop = () => {
    if (jobForm.stops.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum of 5 stops allowed per job.');
      return;
    }
    
    setJobForm(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          address: '',
          latitude: 0,
          longitude: 0,
          orderId: prev.stops.length + 1
        }
      ]
    }));
  };

  const handleUpdateStop = (index: number, field: string, value: string | number) => {
    const updatedStops = [...jobForm.stops];
    // @ts-ignore
    updatedStops[index][field] = value;
    
    setJobForm(prev => ({
      ...prev,
      stops: updatedStops
    }));
  };

  const handleRemoveStop = (index: number) => {
    const updatedStops = jobForm.stops.filter((_, i) => i !== index)
      .map((stop, i) => ({
        ...stop,
        orderId: i + 1
      }));
    
    setJobForm(prev => ({
      ...prev,
      stops: updatedStops
    }));
  };

  const handleDriverSelect = (driver: Driver) => {
    setJobForm(prev => ({
      ...prev,
      driverId: driver.id
    }));
    setShowDriversModal(false);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setJobForm(prev => ({
      ...prev,
      vehicleId: vehicle.id
    }));
    setShowVehiclesModal(false);
  };

  const validateForm = (): boolean => {
    if (!jobForm.pickupAddress.trim()) {
      Alert.alert('Error', 'Pickup address is required');
      return false;
    }
    
    if (!jobForm.pickupLatitude.trim() || !jobForm.pickupLongitude.trim()) {
      Alert.alert('Error', 'Pickup coordinates are required');
      return false;
    }
    
    if (!jobForm.dropoffAddress.trim()) {
      Alert.alert('Error', 'Dropoff address is required');
      return false;
    }
    
    if (!jobForm.dropoffLatitude.trim() || !jobForm.dropoffLongitude.trim()) {
      Alert.alert('Error', 'Dropoff coordinates are required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const jobData = {
      driverId: jobForm.driverId,
      vehicleId: jobForm.vehicleId,
      pickupLocation: {
        address: jobForm.pickupAddress,
        latitude: parseFloat(jobForm.pickupLatitude),
        longitude: parseFloat(jobForm.pickupLongitude)
      },
      dropoffLocation: {
        address: jobForm.dropoffAddress,
        latitude: parseFloat(jobForm.dropoffLatitude),
        longitude: parseFloat(jobForm.dropoffLongitude)
      },
      status: 'pending',
      stops: jobForm.stops.length > 0 ? jobForm.stops : undefined
    };
    
    if (!isConnected) {
      await saveOfflineJob(jobData);
      Alert.alert('Saved Offline', 'Job has been saved locally and will be uploaded when connection is restored.');
      resetForm();
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/jobs`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      Alert.alert(
        'Success',
        'Job created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              fetchData(); // Refresh jobs list
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert(
        'Submission Error',
        'Would you like to save this job to be uploaded later?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              await saveOfflineJob(jobData);
              Alert.alert('Saved', 'Job saved to queue.');
              resetForm();
            }
          },
          {
            text: 'No',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobForm({
      driverId: undefined,
      vehicleId: undefined,
      pickupAddress: '',
      pickupLatitude: '',
      pickupLongitude: '',
      dropoffAddress: '',
      dropoffLatitude: '',
      dropoffLongitude: '',
      stops: []
    });
  };

  const getDriverById = (id?: string) => {
    if (!id) return 'Select Driver';
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getVehicleById = (id?: string) => {
    if (!id) return 'Select Vehicle';
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `Vehicle ${vehicle.id.slice(0, 6)}...` : 'Unknown Vehicle';
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleDriverSelect(item)}
    >
      <Text style={styles.modalItemTitle}>{item.name}</Text>
      <Text style={styles.modalItemSubtitle}>
        Status: {item.status}
      </Text>
    </TouchableOpacity>
  );

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleVehicleSelect(item)}
    >
      <Text style={styles.modalItemTitle}>
        Vehicle {item.id.slice(0, 6)}...
      </Text>
      <Text style={styles.modalItemSubtitle}>
        Status: {item.status}
      </Text>
      {item.vin && (
        <Text style={styles.modalItemSubtitle}>
          VIN: {item.vin.slice(0, 8)}...
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderStopItem = (stop: Stop, index: number) => (
    <View key={index} style={styles.stopItem}>
      <View style={styles.stopHeader}>
        <Text style={styles.stopTitle}>Stop #{stop.orderId}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveStop(index)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.input}
        value={stop.address}
        onChangeText={(value) => handleUpdateStop(index, 'address', value)}
        placeholder="Stop Address"
      />
      
      <View style={styles.coordinatesContainer}>
        <TextInput
          style={[styles.input, styles.coordinateInput]}
          value={stop.latitude.toString()}
          onChangeText={(value) => handleUpdateStop(index, 'latitude', value)}
          placeholder="Latitude"
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, styles.coordinateInput]}
          value={stop.longitude.toString()}
          onChangeText={(value) => handleUpdateStop(index, 'longitude', value)}
          placeholder="Longitude"
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Create Job Assignment</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5856D6" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Assignment</Text>
              
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowDriversModal(true)}
              >
                <Text style={styles.selectorButtonText}>
                  {getDriverById(jobForm.driverId)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowVehiclesModal(true)}
              >
                <Text style={styles.selectorButtonText}>
                  {getVehicleById(jobForm.vehicleId)}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Pickup Location</Text>
              
              <TextInput
                style={styles.input}
                value={jobForm.pickupAddress}
                onChangeText={(value) => handleFormChange('pickupAddress', value)}
                placeholder="Pickup Address"
              />
              
              <View style={styles.coordinatesContainer}>
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={jobForm.pickupLatitude}
                  onChangeText={(value) => handleFormChange('pickupLatitude', value)}
                  placeholder="Latitude"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={jobForm.pickupLongitude}
                  onChangeText={(value) => handleFormChange('pickupLongitude', value)}
                  placeholder="Longitude"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Dropoff Location</Text>
              
              <TextInput
                style={styles.input}
                value={jobForm.dropoffAddress}
                onChangeText={(value) => handleFormChange('dropoffAddress', value)}
                placeholder="Dropoff Address"
              />
              
              <View style={styles.coordinatesContainer}>
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={jobForm.dropoffLatitude}
                  onChangeText={(value) => handleFormChange('dropoffLatitude', value)}
                  placeholder="Latitude"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={jobForm.dropoffLongitude}
                  onChangeText={(value) => handleFormChange('dropoffLongitude', value)}
                  placeholder="Longitude"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Additional Stops</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddStop}
                >
                  <Text style={styles.addButtonText}>+ Add Stop</Text>
                </TouchableOpacity>
              </View>
              
              {jobForm.stops.length > 0 ? (
                jobForm.stops.map((stop, index) => renderStopItem(stop, index))
              ) : (
                <Text style={styles.noStopsText}>
                  No additional stops added yet.
                </Text>
              )}
            </View>
            
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Job Assignment</Text>
              )}
            </TouchableOpacity>
            
            {!isConnected && (
              <View style={styles.offlineMessage}>
                <Text style={styles.offlineText}>
                  You are currently offline. Job will be saved locally and uploaded when connection is restored.
                </Text>
              </View>
            )}
            
            {offlineJobs.length > 0 && (
              <View style={styles.syncContainer}>
                <Text style={styles.syncText}>
                  {offlineJobs.length} jobs waiting to sync
                </Text>
                {isConnected && (
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={syncOfflineJobs}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </Card>
      
      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('FleetTracker' as never)}
        >
          <Text style={styles.navigationButtonText}>Fleet Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('JobTracker' as never)}
        >
          <Text style={styles.navigationButtonText}>Track Jobs</Text>
        </TouchableOpacity>
      </View>
      
      {/* Driver Selection Modal */}
      <Modal
        visible={showDriversModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDriversModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Driver</Text>
              <TouchableOpacity
                onPress={() => setShowDriversModal(false)}
              >
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={drivers.filter(driver => driver.status !== 'offline')}
              renderItem={renderDriverItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No available drivers.</Text>
              }
            />
          </View>
        </View>
      </Modal>
      
      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehiclesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVehiclesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle</Text>
              <TouchableOpacity
                onPress={() => setShowVehiclesModal(false)}
              >
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={vehicles.filter(vehicle => 
                vehicle.status !== 'out_of_service' && 
                vehicle.status !== 'maintenance'
              )}
              renderItem={renderVehicleItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>No available vehicles.</Text>
              }
            />
          </View>
        </View>
      </Modal>
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
  formSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateInput: {
    width: '48%',
  },
  selectorButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  noStopsText: {
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  stopItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
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
    backgroundColor: '#5856D6',
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
    backgroundColor: '#5856D6',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseButton: {
    color: '#5856D6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  modalEmptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#8E8E93',
  },
});

export default JobAssignment;