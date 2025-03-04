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
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import Card from '../components/Card';
import { Job, Vehicle, Driver, TrackingLocation } from '../types';
import useAuth from '../hooks/useAuth';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

const JobTracker: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [locationHistory, setLocationHistory] = useState<TrackingLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Load job data
    fetchData();
    
    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      if (isConnected) {
        refreshData();
      }
    }, 30000);

    // Cleanup function
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isConnected]);

  useEffect(() => {
    // When a job is selected, fetch its location history
    if (selectedJob) {
      fetchJobLocationHistory(selectedJob.id);
    } else {
      setLocationHistory([]);
    }
  }, [selectedJob]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs
      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, {
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
      
      // Fetch drivers
      const driversResponse = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setJobs(jobsResponse.data);
      setVehicles(vehiclesResponse.data);
      setDrivers(driversResponse.data);
      
      // Select the first active job if any
      const activeJobs = jobsResponse.data.filter(
        (job: Job) => job.status === 'in_progress' || job.status === 'assigned'
      );
      
      if (activeJobs.length > 0 && !selectedJob) {
        setSelectedJob(activeJobs[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load job data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      // Fetch jobs
      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, {
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
      
      setJobs(jobsResponse.data);
      setVehicles(vehiclesResponse.data);
      
      // Refresh the selected job location history if applicable
      if (selectedJob) {
        const updatedJob = jobsResponse.data.find((j: Job) => j.id === selectedJob.id);
        if (updatedJob) {
          setSelectedJob(updatedJob);
          fetchJobLocationHistory(updatedJob.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchJobLocationHistory = async (jobId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLocationHistory(response.data);
      
      // If we have location history and a map ref, fit map to show all points
      if (response.data.length > 0 && mapRef.current) {
        fitMapToLocations(response.data);
      }
    } catch (error) {
      console.error('Error fetching location history:', error);
      setLocationHistory([]);
    }
  };

  const fitMapToLocations = (locations: TrackingLocation[]) => {
    if (locations.length === 0 || !selectedJob) return;
    
    const points = [
      ...locations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude
      })),
      {
        latitude: selectedJob.pickupLocation.latitude,
        longitude: selectedJob.pickupLocation.longitude
      },
      {
        latitude: selectedJob.dropoffLocation.latitude,
        longitude: selectedJob.dropoffLocation.longitude
      }
    ];
    
    // Add stops if they exist
    if (selectedJob.stops) {
      selectedJob.stops.forEach(stop => {
        points.push({
          latitude: stop.latitude,
          longitude: stop.longitude
        });
      });
    }
    
    if (points.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true
      });
    }
  };
  
  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return '#34C759'; // Green
      case 'assigned':
        return '#007AFF'; // Blue
      case 'pending':
        return '#FF9500'; // Orange
      case 'completed':
        return '#5856D6'; // Purple
      case 'cancelled':
        return '#FF3B30'; // Red
      default:
        return '#8E8E93'; // Gray
    }
  };

  const getDriverNameById = (driverId?: string) => {
    if (!driverId) return 'Unassigned';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getVehicleById = (vehicleId?: string) => {
    if (!vehicleId) return null;
    return vehicles.find(v => v.id === vehicleId) || null;
  };

  const updateJobStatus = async (jobId: string, newStatus: "pending" | "assigned" | "in_progress" | "completed" | "cancelled") => {
    if (!isConnected) {
      Alert.alert('Offline', 'Cannot update job status while offline.');
      return;
    }
    
    try {
      await axios.put(
        `${API_BASE_URL}/jobs/${jobId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local job state
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
      
      // Update selected job if it's the one being modified
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, status: newStatus });
      }
      
      Alert.alert('Success', `Job status updated to ${newStatus}.`);
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status. Please try again.');
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  // Using unique job ID for key instead of index
  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={[
        styles.jobItem,
        selectedJob?.id === item.id ? styles.selectedJobItem : null
      ]}
      onPress={() => handleJobSelect(item)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobId}>
          Job {item.id.slice(0, 6)}...
        </Text>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: getJobStatusColor(item.status) }
        ]} />
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={styles.jobDriver}>
          Driver: {getDriverNameById(item.driverId)}
        </Text>
        
        <Text style={styles.jobLocation}>
          From: {item.pickupLocation.address.length > 25 
            ? item.pickupLocation.address.substring(0, 25) + '...' 
            : item.pickupLocation.address}
        </Text>
        
        <Text style={styles.jobLocation}>
          To: {item.dropoffLocation.address.length > 25 
            ? item.dropoffLocation.address.substring(0, 25) + '...' 
            : item.dropoffLocation.address}
        </Text>
        
        <Text style={styles.jobStatus}>
          Status: <Text style={{ color: getJobStatusColor(item.status) }}>{item.status}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {selectedJob && (
            <>
              {/* Pickup Location */}
              <Marker
                coordinate={{
                  latitude: selectedJob.pickupLocation.latitude,
                  longitude: selectedJob.pickupLocation.longitude
                }}
                pinColor="#FF9500" // Orange
                title="Pickup"
                description={selectedJob.pickupLocation.address}
              />
              
              {/* Dropoff Location */}
              <Marker
                coordinate={{
                  latitude: selectedJob.dropoffLocation.latitude,
                  longitude: selectedJob.dropoffLocation.longitude
                }}
                pinColor="#FF3B30" // Red
                title="Dropoff"
                description={selectedJob.dropoffLocation.address}
              />
              
              {/* Additional Stops */}
              {selectedJob.stops?.map((stop, index) => (
                <Marker
                  key={`stop-${index}`}
                  coordinate={{
                    latitude: stop.latitude,
                    longitude: stop.longitude
                  }}
                  pinColor="#5856D6" // Purple
                  title={`Stop #${stop.orderId}`}
                  description={stop.address}
                />
              ))}
              
              {/* Vehicle Location (if assigned and exists in our data) */}
              {selectedJob.vehicleId && (
                getVehicleById(selectedJob.vehicleId) && (
                  <Marker
                    coordinate={{
                      latitude: getVehicleById(selectedJob.vehicleId)!.latitude,
                      longitude: getVehicleById(selectedJob.vehicleId)!.longitude
                    }}
                    pinColor="#34C759" // Green
                    title="Vehicle"
                    description={selectedJob.vehicleId}
                  >
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>Vehicle Location</Text>
                        <Text>Status: {getVehicleById(selectedJob.vehicleId)!.status}</Text>
                        <Text>Driver: {getDriverNameById(selectedJob.driverId)}</Text>
                      </View>
                    </Callout>
                  </Marker>
                )
              )}
              
              {/* Location History Path */}
              {locationHistory.length > 0 && (
                <Polyline
                  coordinates={locationHistory.map(loc => ({
                    latitude: loc.latitude,
                    longitude: loc.longitude
                  }))}
                  strokeColor="#007AFF" // Blue
                  strokeWidth={4}
                />
              )}
            </>
          )}
        </MapView>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshData}
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
          <Text style={styles.listTitle}>Active Jobs</Text>
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
            <Text style={styles.loadingText}>Loading job data...</Text>
          </View>
        ) : (
          <FlatList
            data={jobs.filter(job => job.status !== 'completed' && job.status !== 'cancelled')}
            renderItem={renderJobItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsList}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  No active jobs available.
                </Text>
              </View>
            }
          />
        )}
      </View>
      
      {selectedJob && (
        <Card style={styles.selectedJobCard}>
          <Text style={styles.selectedJobTitle}>
            Selected Job Details
          </Text>
          
          <View style={styles.selectedJobDetails}>
            <View style={styles.selectedJobRow}>
              <Text style={styles.selectedJobLabel}>Job ID:</Text>
              <Text style={styles.selectedJobValue}>{selectedJob.id.slice(0, 10)}...</Text>
            </View>
            
            <View style={styles.selectedJobRow}>
              <Text style={styles.selectedJobLabel}>Driver:</Text>
              <Text style={styles.selectedJobValue}>{getDriverNameById(selectedJob.driverId)}</Text>
            </View>
            
            <View style={styles.selectedJobRow}>
              <Text style={styles.selectedJobLabel}>Status:</Text>
              <Text style={[
                styles.selectedJobValue, 
                { color: getJobStatusColor(selectedJob.status) }
              ]}>
                {selectedJob.status.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.selectedJobRow}>
              <Text style={styles.selectedJobLabel}>Pickup:</Text>
              <Text style={styles.selectedJobValue}>{selectedJob.pickupLocation.address}</Text>
            </View>
            
            <View style={styles.selectedJobRow}>
              <Text style={styles.selectedJobLabel}>Dropoff:</Text>
              <Text style={styles.selectedJobValue}>{selectedJob.dropoffLocation.address}</Text>
            </View>
            
            {selectedJob.stops && selectedJob.stops.length > 0 && (
              <View style={styles.selectedJobRow}>
                <Text style={styles.selectedJobLabel}>Stops:</Text>
                <Text style={styles.selectedJobValue}>{selectedJob.stops.length} additional stops</Text>
              </View>
            )}
          </View>
          
          <View style={styles.statusActionContainer}>
            <Text style={styles.statusActionTitle}>Update Job Status:</Text>
            <View style={styles.statusButtons}>
              {selectedJob.status !== 'assigned' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#007AFF' }]}
                  onPress={() => updateJobStatus(selectedJob.id, 'assigned')}
                >
                  <Text style={styles.statusButtonText}>Assign</Text>
                </TouchableOpacity>
              )}
              
              {selectedJob.status !== 'in_progress' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#34C759' }]}
                  onPress={() => updateJobStatus(selectedJob.id, 'in_progress')}
                >
                  <Text style={styles.statusButtonText}>In Progress</Text>
                </TouchableOpacity>
              )}
              
              {selectedJob.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#5856D6' }]}
                  onPress={() => updateJobStatus(selectedJob.id, 'completed')}
                >
                  <Text style={styles.statusButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
              
              {selectedJob.status !== 'cancelled' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: '#FF3B30' }]}
                  onPress={() => updateJobStatus(selectedJob.id, 'cancelled')}
                >
                  <Text style={styles.statusButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      )}
      
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
  jobsList: {
    paddingRight: 16,
  },
  jobItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedJobItem: {
    borderWidth: 2,
    borderColor: '#5856D6',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  jobDetails: {
    flex: 1,
  },
  jobDriver: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  jobStatus: {
    fontSize: 14,
    color: '#333333',
    marginTop: 4,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  emptyStateContainer: {
    width: width - 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedJobCard: {
    margin: 16,
    marginTop: 0,
  },
  selectedJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  selectedJobDetails: {
    marginBottom: 16,
  },
  selectedJobRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  selectedJobLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  selectedJobValue: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  statusActionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  statusActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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

export default JobTracker;