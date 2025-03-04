import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import { EldService } from '../services/EldService';
import NetInfo from '@react-native-community/netinfo';
import useAuth from '../hooks/useAuth';

const EldManagement: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [eldDevices, setEldDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  
  // New device form
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [deviceSerial, setDeviceSerial] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  
  // Driver HOS modal
  const [showDriverHosModal, setShowDriverHosModal] = useState<boolean>(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [driverHosData, setDriverHosData] = useState<any | null>(null);
  const [loadingHos, setLoadingHos] = useState<boolean>(false);
  
  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    
    // Check if tenant has ELD access
    const checkAccess = async () => {
      const access = await EldService.hasEldAccess();
      setHasAccess(access);
      
      if (access) {
        await loadDevices();
      } else {
        setIsLoading(false);
      }
    };
    
    checkAccess();
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const devices = await EldService.getDevices();
      setEldDevices(devices);
    } catch (error) {
      console.error('Error loading ELD devices:', error);
      Alert.alert('Error', 'Failed to load ELD devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const registerDevice = async () => {
    if (!deviceSerial.trim()) {
      Alert.alert('Error', 'Device serial number is required');
      return;
    }
    
    setIsRegistering(true);
    try {
      await EldService.registerDevice(deviceSerial.trim(), vehicleId.trim() || undefined);
      
      // Reset form and close modal
      setDeviceSerial('');
      setVehicleId('');
      setShowRegisterModal(false);
      
      // Reload devices
      await loadDevices();
      
      Alert.alert('Success', 'ELD device registered successfully');
    } catch (error) {
      console.error('Error registering device:', error);
      Alert.alert('Error', 'Failed to register ELD device. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const viewDriverHos = async (driverId: string) => {
    setSelectedDriverId(driverId);
    setLoadingHos(true);
    setShowDriverHosModal(true);
    
    try {
      // Get last 7 days of HOS data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const hosData = await EldService.getDriverHos(
        driverId,
        sevenDaysAgo.toISOString().split('T')[0]
      );
      
      // Get HOS summary
      const hosSummary = await EldService.getDriverHosSummary(driverId);
      
      setDriverHosData({
        logs: hosData,
        summary: hosSummary
      });
    } catch (error) {
      console.error('Error loading driver HOS data:', error);
      Alert.alert('Error', 'Failed to load driver HOS data');
      setShowDriverHosModal(false);
    } finally {
      setLoadingHos(false);
    }
  };
  
  const associateDeviceWithVehicle = async () => {
    if (!selectedDevice) return;
    
    // Use a cross-platform approach instead of Alert.prompt
    // For simplicity, we'll just show an alert with instructions
    // In a real app, you would use a modal with TextInput
    Alert.alert(
      'Associate Device',
      'Please use the "Edit Device" screen to associate this device with a vehicle.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Associate',
          onPress: async () => {
            // This would normally use a vehicleId from user input
            // For demo purposes, we'll use a hardcoded value or ask user to use another screen
            const vehicleId = selectedDevice.vehicle_id || "VEHICLE_001"; 
            
            try {
              await EldService.associateDeviceWithVehicle(selectedDevice.id, vehicleId);
              
              // Reload devices
              await loadDevices();
              
              Alert.alert('Success', 'Device associated with vehicle successfully');
            } catch (error) {
              console.error('Error associating device with vehicle:', error);
              Alert.alert('Error', 'Failed to associate device with vehicle');
            }
          }
        }
      ]
    );
  };
  
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  const formatTime = (minutes: number): string => {
    if (minutes === undefined || minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      case 'active':
        return '#34C759'; // Green
      case 'inactive':
        return '#FF3B30'; // Red
      case 'maintenance':
        return '#FF9500'; // Orange
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5856D6" />
        <Text style={styles.loadingText}>Loading ELD devices...</Text>
      </View>
    );
  }
  
  if (hasAccess === false) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.title}>ELD Management</Text>
          <Text style={styles.subscriptionRequired}>
            This feature requires a Premium or Enterprise subscription.
          </Text>
          <Text style={styles.upgradeText}>
            Please contact your administrator to upgrade your subscription to access
            electronic logging device management features.
          </Text>
        </Card>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>ELD Management</Text>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Some features may have limited functionality.
            </Text>
          </View>
        )}
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRegisterModal(true)}
          >
            <Text style={styles.addButtonText}>Register New Device</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadDevices}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.deviceListContainer}>
          <Text style={styles.sectionTitle}>Registered Devices ({eldDevices.length})</Text>
          
          {eldDevices.length === 0 ? (
            <Text style={styles.noDevicesText}>
              No ELD devices registered. Click "Register New Device" to add one.
            </Text>
          ) : (
            <FlatList
              data={eldDevices}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.deviceItem,
                    selectedDevice?.id === item.id ? styles.selectedDeviceItem : null
                  ]}
                  onPress={() => setSelectedDevice(item)}
                >
                  <View style={styles.deviceHeader}>
                    <Text style={styles.deviceSerial}>
                      {item.device_serial}
                    </Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(item.status) }
                    ]} />
                  </View>
                  
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceProperty}>
                      Status: <Text style={styles.deviceValue}>{item.status.toUpperCase()}</Text>
                    </Text>
                    
                    <Text style={styles.deviceProperty}>
                      Vehicle ID: <Text style={styles.deviceValue}>{item.vehicle_id || 'Not assigned'}</Text>
                    </Text>
                    
                    <Text style={styles.deviceProperty}>
                      Last ping: <Text style={styles.deviceValue}>{formatDateTime(item.last_ping)}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        
        {selectedDevice && (
          <View style={styles.selectedDeviceActions}>
            <Text style={styles.sectionTitle}>Device Actions</Text>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={associateDeviceWithVehicle}
              >
                <Text style={styles.actionButtonText}>Associate with Vehicle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (selectedDevice.vehicle_id) {
                    viewDriverHos(selectedDevice.driver_id);
                  } else {
                    Alert.alert('No Driver', 'This device is not associated with any vehicle or driver');
                  }
                }}
                disabled={!selectedDevice.vehicle_id}
              >
                <Text style={styles.actionButtonText}>View Driver HOS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                  Alert.alert(
                    'Deactivate Device',
                    'Are you sure you want to deactivate this device?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Deactivate',
                        onPress: async () => {
                          try {
                            await EldService.updateDeviceStatus(selectedDevice.id, 'inactive');
                            await loadDevices();
                          } catch (error) {
                            console.error('Error deactivating device:', error);
                            Alert.alert('Error', 'Failed to deactivate device');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.actionButtonText}>Deactivate Device</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
      
      {/* Register Device Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register ELD Device</Text>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)}>
                <Text style={styles.closeButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Device Serial Number *</Text>
              <TextInput
                style={styles.input}
                value={deviceSerial}
                onChangeText={setDeviceSerial}
                placeholder="Enter device serial number"
                autoCapitalize="characters"
              />
              
              <Text style={styles.inputLabel}>Vehicle ID (Optional)</Text>
              <TextInput
                style={styles.input}
                value={vehicleId}
                onChangeText={setVehicleId}
                placeholder="Enter vehicle ID to associate"
              />
              
              <TouchableOpacity
                style={[styles.registerButton, isRegistering ? styles.disabledButton : null]}
                onPress={registerDevice}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Register Device</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Driver HOS Modal */}
      <Modal
        visible={showDriverHosModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDriverHosModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver HOS</Text>
              <TouchableOpacity onPress={() => setShowDriverHosModal(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {loadingHos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5856D6" />
                <Text style={styles.loadingText}>Loading HOS data...</Text>
              </View>
            ) : driverHosData ? (
              <ScrollView style={styles.hosContainer}>
                <View style={styles.hosSummaryContainer}>
                  <Text style={styles.hosSummaryTitle}>Current Status</Text>
                  
                  <View style={[
                    styles.hosStatusBadge,
                    { backgroundColor: getStatusColor(driverHosData.summary?.current_status || 'off_duty') }
                  ]}>
                    <Text style={styles.hosStatusText}>
                      {driverHosData.summary?.current_status?.replace('_', ' ').toUpperCase() || 'OFF DUTY'}
                    </Text>
                  </View>
                  
                  <View style={styles.hosTimesContainer}>
                    <View style={styles.hosTimeItem}>
                      <Text style={styles.hosTimeLabel}>Drive Time Remaining</Text>
                      <Text style={styles.hosTimeValue}>
                        {formatTime(driverHosData.summary?.remaining_drive_time_minutes)}
                      </Text>
                    </View>
                    
                    <View style={styles.hosTimeItem}>
                      <Text style={styles.hosTimeLabel}>Duty Time Remaining</Text>
                      <Text style={styles.hosTimeValue}>
                        {formatTime(driverHosData.summary?.remaining_duty_time_minutes)}
                      </Text>
                    </View>
                  </View>
                  
                  {driverHosData.summary?.violations && driverHosData.summary.violations.length > 0 && (
                    <View style={styles.hosViolationsContainer}>
                      <Text style={styles.hosViolationsTitle}>Violations</Text>
                      
                      {driverHosData.summary.violations.map((violation: any, index: number) => (
                        <View key={index} style={styles.hosViolationItem}>
                          <Text style={styles.hosViolationType}>
                            {violation.type.replace('_', ' ').toUpperCase()}
                          </Text>
                          <Text style={styles.hosViolationDesc}>{violation.description}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <Text style={styles.hosLogsTitle}>HOS Logs (Last 7 Days)</Text>
                
                {driverHosData.logs.length === 0 ? (
                  <Text style={styles.noLogsText}>No HOS logs found for the past 7 days.</Text>
                ) : (
                  driverHosData.logs.map((log: any, index: number) => (
                    <View key={index} style={styles.hosLogItem}>
                      <View style={[
                        styles.hosLogStatusDot,
                        { backgroundColor: getStatusColor(log.status) }
                      ]} />
                      
                      <View style={styles.hosLogContent}>
                        <Text style={styles.hosLogStatus}>
                          {log.status.replace('_', ' ').toUpperCase()}
                        </Text>
                        
                        <Text style={styles.hosLogTime}>
                          {formatDateTime(log.start_time)}
                          {log.end_time ? ` - ${formatDateTime(log.end_time)}` : ' (Current)'}
                        </Text>
                        
                        {log.duration_minutes && (
                          <Text style={styles.hosLogDuration}>
                            Duration: {formatTime(log.duration_minutes)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              <Text style={styles.noHosDataText}>Failed to load HOS data.</Text>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.7,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.25,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  deviceListContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  noDevicesText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
  },
  deviceItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedDeviceItem: {
    borderWidth: 2,
    borderColor: '#5856D6',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceSerial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceDetails: {
    marginBottom: 8,
  },
  deviceProperty: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  deviceValue: {
    fontWeight: '600',
    color: '#000000',
  },
  selectedDeviceActions: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
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
    color: '#5856D6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalForm: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  hosContainer: {
    padding: 16,
  },
  hosSummaryContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  hosSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  hosStatusBadge: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  hosStatusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hosTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hosTimeItem: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  hosTimeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  hosTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  hosViolationsContainer: {
    backgroundColor: '#FFEFEF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  hosViolationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  hosViolationItem: {
    marginBottom: 8,
  },
  hosViolationType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  hosViolationDesc: {
    fontSize: 12,
    color: '#666666',
  },
  hosLogsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  hosLogItem: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  hosLogStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 4,
  },
  hosLogContent: {
    flex: 1,
  },
  hosLogStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  hosLogTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  hosLogDuration: {
    fontSize: 12,
    color: '#666666',
  },
  noLogsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  noHosDataText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
});

export default EldManagement;