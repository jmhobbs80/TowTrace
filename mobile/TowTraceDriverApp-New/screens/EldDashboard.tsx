import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Card from '../components/Card';
import { EldService } from '../services/EldService';
import NetInfo from '@react-native-community/netinfo';
import useAuth from '../hooks/useAuth';

const EldDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  interface HosSummary {
    current_status?: string;
    current_status_start_time?: string;
    remaining_drive_time_minutes: number;
    remaining_duty_time_minutes: number;
    violations?: {
      type: string;
      description: string;
    }[];
  }
  
  interface HosLog {
    id: string;
    status: string;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
  }
  
  const [hosSummary, setHosSummary] = useState<HosSummary | null>(null);
  const [hosLogs, setHosLogs] = useState<HosLog[]>([]);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  
  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to sync offline HOS updates when connectivity returns
      if (state.isConnected) {
        EldService.syncOfflineHosUpdates();
      }
    });
    
    // Check if tenant has ELD access
    const checkAccess = async () => {
      const access = await EldService.hasEldAccess();
      setHasAccess(access);
      
      if (access) {
        await loadData();
      } else {
        setIsLoading(false);
      }
    };
    
    checkAccess();
    
    return () => {
      unsubscribe();
    };
  }, [token]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get HOS summary
      const summary = await EldService.getCurrentDriverHosSummary();
      setHosSummary(summary);
      
      // Get recent HOS logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const logs = await EldService.getDriverHosLogs(
        sevenDaysAgo.toISOString().split('T')[0]
      );
      setHosLogs(logs);
    } catch (error) {
      console.error('Error loading ELD data:', error);
      Alert.alert('Error', 'Failed to load ELD data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateStatus = async (newStatus: 'on_duty' | 'off_duty' | 'driving' | 'sleeping') => {
    setUpdatingStatus(true);
    try {
      await EldService.updateHosStatus(newStatus);
      
      // Reload data
      await loadData();
      
      Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating HOS status:', error);
      
      if (!isConnected) {
        Alert.alert(
          'Offline Mode', 
          'Your status change has been recorded and will be uploaded when connection is restored.'
        );
      } else {
        Alert.alert('Error', 'Failed to update status. Please try again.');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatDateTime = (dateTimeStr: string): string => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'driving':
        return '#34C759'; // Green
      case 'on_duty':
        return '#FF9500'; // Orange
      case 'off_duty':
        return '#FF3B30'; // Red
      case 'sleeping':
        return '#007AFF'; // Blue
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading ELD data...</Text>
      </View>
    );
  }
  
  if (hasAccess === false) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.title}>ELD Dashboard</Text>
          <Text style={styles.subscriptionRequired}>
            This feature requires a Premium or Enterprise subscription.
          </Text>
          <Text style={styles.upgradeText}>
            Please contact your administrator to upgrade your subscription to access
            electronic logging device features.
          </Text>
        </Card>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>ELD Dashboard</Text>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Some features may have limited functionality.
            </Text>
          </View>
        )}
        
        <View style={styles.currentStatusContainer}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(hosSummary?.current_status || 'off_duty') }
          ]}>
            <Text style={styles.statusText}>
              {hosSummary?.current_status?.replace('_', ' ') || 'OFF DUTY'}
            </Text>
          </View>
          
          <Text style={styles.statusSince}>
            Since: {formatDateTime(hosSummary?.current_status_start_time || new Date().toISOString())}
          </Text>
        </View>
        
        <View style={styles.remainingTimeContainer}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Drive Time Remaining</Text>
            <Text style={styles.timeValue}>
              {hosSummary ? formatTime(hosSummary.remaining_drive_time_minutes) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Duty Time Remaining</Text>
            <Text style={styles.timeValue}>
              {hosSummary ? formatTime(hosSummary.remaining_duty_time_minutes) : 'N/A'}
            </Text>
          </View>
        </View>
        
        {hosSummary?.violations && hosSummary.violations.length > 0 && (
          <View style={styles.violationsContainer}>
            <Text style={styles.violationsTitle}>Violations</Text>
            
            {hosSummary.violations.map((violation: any, index: number) => (
              <View key={index} style={styles.violationItem}>
                <Text style={styles.violationType}>
                  {violation.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.violationDesc}>{violation.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.statusButtonsContainer}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          
          <View style={styles.statusButtonsGrid}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor('driving') },
                hosSummary?.current_status === 'driving' ? styles.activeStatusButton : null,
                updatingStatus ? styles.disabledButton : null
              ]}
              onPress={() => updateStatus('driving')}
              disabled={updatingStatus || hosSummary?.current_status === 'driving'}
            >
              <Text style={styles.statusButtonText}>Driving</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor('on_duty') },
                hosSummary?.current_status === 'on_duty' ? styles.activeStatusButton : null,
                updatingStatus ? styles.disabledButton : null
              ]}
              onPress={() => updateStatus('on_duty')}
              disabled={updatingStatus || hosSummary?.current_status === 'on_duty'}
            >
              <Text style={styles.statusButtonText}>On Duty</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor('off_duty') },
                hosSummary?.current_status === 'off_duty' ? styles.activeStatusButton : null,
                updatingStatus ? styles.disabledButton : null
              ]}
              onPress={() => updateStatus('off_duty')}
              disabled={updatingStatus || hosSummary?.current_status === 'off_duty'}
            >
              <Text style={styles.statusButtonText}>Off Duty</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor('sleeping') },
                hosSummary?.current_status === 'sleeping' ? styles.activeStatusButton : null,
                updatingStatus ? styles.disabledButton : null
              ]}
              onPress={() => updateStatus('sleeping')}
              disabled={updatingStatus || hosSummary?.current_status === 'sleeping'}
            >
              <Text style={styles.statusButtonText}>Sleeping</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.viewLogsButton}
          onPress={() => setShowLogsModal(true)}
        >
          <Text style={styles.viewLogsButtonText}>View HOS Logs</Text>
        </TouchableOpacity>
      </Card>
      
      <Modal
        visible={showLogsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hours of Service Logs</Text>
              <TouchableOpacity onPress={() => setShowLogsModal(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={hosLogs}
              keyExtractor={(item: HosLog) => item.id}
              contentContainerStyle={styles.logsList}
              renderItem={({ item }) => (
                <View style={styles.logItem}>
                  <View style={[
                    styles.logStatusDot,
                    { backgroundColor: getStatusColor(item.status || 'off_duty') }
                  ]} />
                  
                  <View style={styles.logContent}>
                    <Text style={styles.logStatus}>
                      {(item.status || 'off_duty').replace('_', ' ').toUpperCase()}
                    </Text>
                    
                    <Text style={styles.logTime}>
                      {formatDateTime(item.start_time)}
                      {item.end_time ? ` - ${formatDateTime(item.end_time)}` : ' (Current)'}
                    </Text>
                    
                    {item.duration_minutes && (
                      <Text style={styles.logDuration}>
                        Duration: {formatTime(item.duration_minutes)}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noLogsText}>No HOS logs found for the past 7 days.</Text>
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
  loadingText: {
    marginTop: 10,
    color: '#666666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  subscriptionRequired: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  offlineMessage: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  currentStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  statusSince: {
    color: '#666666',
    fontSize: 14,
  },
  remainingTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeBox: {
    flex: 0.48,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  violationsContainer: {
    backgroundColor: '#FFEFEF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  violationItem: {
    marginBottom: 8,
  },
  violationType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  violationDesc: {
    fontSize: 14,
    color: '#666666',
  },
  statusButtonsContainer: {
    marginBottom: 20,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeStatusButton: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  viewLogsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  viewLogsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    height: '80%',
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
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logsList: {
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  logStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  logDuration: {
    fontSize: 14,
    color: '#666666',
  },
  noLogsText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
});

export default EldDashboard;