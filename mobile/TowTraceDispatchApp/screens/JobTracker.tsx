import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios, { AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList, Job, TrackingLocation } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'JobTracker'>;

export default function JobTracker({ route, navigation }: Readonly<Props>) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchJobs();

    // Set up refresh interval
    const intervalId = setInterval(() => {
      if (selectedJob) {
        fetchTrackingHistory(selectedJob.id);
      } else {
        fetchJobs(false); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // When a job is selected, fetch its tracking history
  useEffect(() => {
    if (selectedJob) {
      fetchTrackingHistory(selectedJob.id);
    } else {
      setTrackingHistory([]);
    }
  }, [selectedJob]);

  const fetchJobs = async (showLoading = true): Promise<void> => {
    if (showLoading) setIsLoading(true);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    
    if (!isConnected) {
      if (showLoading) setIsLoading(false);
      Alert.alert("Offline", "Cannot fetch jobs while offline.");
      return;
    }

    try {
      const response = await axios.get(
        'https://towtrace-api.justin-michael-hobbs.workers.dev/jobs',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setJobs(response.data);
      
      // If no job is currently selected but we have jobs, select the first active one
      if (!selectedJob && response.data.length > 0) {
        const activeJob = response.data.find((job: Job) => job.status === 'in_progress');
        if (activeJob) {
          setSelectedJob(activeJob);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Job Fetch Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to fetch jobs: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to fetch jobs: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      if (showLoading) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrackingHistory = async (jobId: string): Promise<void> => {
    setIsLoadingHistory(true);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    
    if (!isConnected) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://towtrace-api.justin-michael-hobbs.workers.dev/jobs/${jobId}/tracking`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setTrackingHistory(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Tracking History Fetch Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      } else {
        console.error('Unexpected Error:', error);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    if (selectedJob) {
      fetchTrackingHistory(selectedJob.id);
      setRefreshing(false);
    } else {
      fetchJobs();
    }
  };

  const handleJobSelect = (job: Job): void => {
    setSelectedJob(job);
  };

  const getMapRegion = () => {
    if (selectedJob && trackingHistory.length > 0) {
      // If we have tracking history, center map on the most recent location
      const mostRecent = trackingHistory[trackingHistory.length - 1];
      
      return {
        latitude: mostRecent.latitude,
        longitude: mostRecent.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else if (selectedJob) {
      // If we have a job but no tracking history, center on pickup
      return {
        latitude: selectedJob.pickupLocation.latitude,
        longitude: selectedJob.pickupLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    } else {
      // Default region
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading job data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation={false}
          showsTraffic={true}
        >
          {/* If we have a selected job, show its route markers */}
          {selectedJob && (
            <>
              {/* Pickup location */}
              <Marker
                coordinate={{
                  latitude: selectedJob.pickupLocation.latitude,
                  longitude: selectedJob.pickupLocation.longitude,
                }}
                title="Pickup"
                description={selectedJob.pickupLocation.address}
                pinColor="green"
              />

              {/* Stops */}
              {selectedJob.stops?.map(stop => (
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

              {/* Dropoff location */}
              <Marker
                coordinate={{
                  latitude: selectedJob.dropoffLocation.latitude,
                  longitude: selectedJob.dropoffLocation.longitude,
                }}
                title="Dropoff"
                description={selectedJob.dropoffLocation.address}
                pinColor="red"
              />

              {/* Current vehicle location */}
              {trackingHistory.length > 0 && (
                <Marker
                  coordinate={{
                    latitude: trackingHistory[trackingHistory.length - 1].latitude,
                    longitude: trackingHistory[trackingHistory.length - 1].longitude,
                  }}
                  title="Current Location"
                  description={`Last updated: ${new Date(trackingHistory[trackingHistory.length - 1].timestamp).toLocaleTimeString()}`}
                  pinColor="orange"
                />
              )}

              {/* Path traveled */}
              {trackingHistory.length > 1 && (
                <Polyline
                  coordinates={trackingHistory.map(point => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor="#4287f5"
                  strokeWidth={4}
                />
              )}
            </>
          )}
        </MapView>

        {isLoadingHistory && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#4287f5" size="small" />
            <Text style={styles.loadingText}>Updating tracking data...</Text>
          </View>
        )}
      </View>

      <View style={styles.jobsContainer}>
        <Text style={styles.jobsTitle}>Active Jobs ({jobs.length})</Text>
        
        <ScrollView
          style={styles.jobsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {jobs.length === 0 ? (
            <Text style={styles.emptyText}>No active jobs</Text>
          ) : (
            jobs.map(job => (
              <TouchableOpacity
                key={job.id}
                style={[
                  styles.jobItem,
                  selectedJob?.id === job.id && styles.selectedJob,
                  job.status === 'completed' && styles.completedJob,
                  job.status === 'cancelled' && styles.cancelledJob,
                ]}
                onPress={() => handleJobSelect(job)}
              >
                <View style={styles.jobInfo}>
                  <Text style={styles.jobId}>Job #{job.id.substring(0, 8)}</Text>
                  <Text style={styles.jobDetail}>
                    From: {job.pickupLocation.address.substring(0, 30)}
                    {job.pickupLocation.address.length > 30 ? '...' : ''}
                  </Text>
                  <Text style={styles.jobDetail}>
                    To: {job.dropoffLocation.address.substring(0, 30)}
                    {job.dropoffLocation.address.length > 30 ? '...' : ''}
                  </Text>
                  <View style={styles.jobFooter}>
                    <Text style={[
                      styles.jobStatus,
                      job.status === 'in_progress' && styles.statusInProgress,
                      job.status === 'completed' && styles.statusCompleted,
                      job.status === 'cancelled' && styles.statusCancelled,
                      job.status === 'pending' && styles.statusPending,
                      job.status === 'assigned' && styles.statusAssigned,
                    ]}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.jobDate}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
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
  loadingOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  jobsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    padding: 12,
  },
  jobsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  jobsList: {
    flex: 1,
  },
  jobItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedJob: {
    backgroundColor: '#e6f0ff',
    borderWidth: 2,
    borderColor: '#4287f5',
  },
  completedJob: {
    opacity: 0.7,
  },
  cancelledJob: {
    opacity: 0.5,
  },
  jobInfo: {
    flex: 1,
  },
  jobId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  jobDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusInProgress: {
    backgroundColor: '#b3e0ff',
    color: '#0066cc',
  },
  statusCompleted: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusAssigned: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  },
  jobDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});