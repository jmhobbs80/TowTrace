import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Button, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, Code, CodeScannerFrame } from 'react-native-vision-camera';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Vehicle } from '../types';
import { useAuth } from '../hooks/useAuth';
import NetInfo from '@react-native-community/netinfo';

// Define the type for useCameraDevices return value
interface CameraDevices {
  back?: CameraDevice;
  front?: CameraDevice;
}

export default function VINScanner({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'VINScanner'>>) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [vin, setVin] = useState<string | null>(null);
  const [queuedVins, setQueuedVins] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scannedVehicles, setScannedVehicles] = useState<Vehicle[]>([]);
  
  const devices = useCameraDevices() as CameraDevices;
  const { token } = useAuth();
  const device = devices?.back;
  const camera = useRef<Camera>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async (): Promise<void> => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera access in settings to scan VINs.');
    }
  };

  const scanVIN = async (barcodeData: string): Promise<void> => {
    if (!barcodeData || barcodeData.length !== 17) {
      Alert.alert('Error', 'Invalid VIN format. VIN must be 17 characters.');
      return;
    }
    
    setVin(barcodeData);
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    
    try {
      if (!isConnected) {
        setQueuedVins(prev => [...prev, barcodeData]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
        return;
      }
      
      setIsSubmitting(true);
      // Upload the VIN 
      const response = await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/fleet/vehicles/register', 
        { vin: barcodeData }, 
        {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }
      );
      
      // Add to scanned vehicles list
      if (response.data) {
        setScannedVehicles(prev => [response.data, ...prev]);
      }
      
      Alert.alert('Success', `VIN Scanned and Registered: ${barcodeData}`);
      setVin(null); // Reset for new scan
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('VIN Scan Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to register VIN: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to register VIN: ' + (error instanceof Error ? error.message : String(error)));
      }
      
      if (!isConnected) {
        setQueuedVins(prev => [...prev, barcodeData]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncQueuedVins = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedVins.length === 0) return;

    setIsSubmitting(true);
    
    try {
      for (const queuedVin of queuedVins) {
        try {
          const response = await axios.post(
            'https://towtrace-api.justin-michael-hobbs.workers.dev/fleet/vehicles/register', 
            { vin: queuedVin }, 
            {
              headers: { Authorization: `Bearer ${token ?? ''}` },
            }
          );
          
          // Add to scanned vehicles list
          if (response.data) {
            setScannedVehicles(prev => [response.data, ...prev]);
          }
          
          setQueuedVins(prev => prev.filter(v => v !== queuedVin));
          Alert.alert('Success', `Synced queued VIN: ${queuedVin}`);
        } catch (error: unknown) {
          console.error('Sync Error:', error);
          break; // Stop syncing if an error occurs
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncQueuedVins();
      }
    });
    return () => unsubscribe();
  }, [queuedVins]);

  const navigateToFleetTracker = (): void => {
    navigation.navigate('FleetTracker');
  };

  if (!hasPermission) return <Text>Camera permission denied</Text>;
  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={true}
          codeScanner={{
            codeTypes: ['code-39', 'qr', 'ean-13', 'code-128', 'pdf-417', 'aztec'],
            onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
              if (codes.length > 0 && !vin && !isSubmitting) {
                setVin(codes[0].value ?? '');
              }
            },
          }}
        />
      </View>
      
      <View style={styles.controls}>
        <View style={styles.scanInfo}>
          {vin ? (
            <>
              <Text style={styles.scanText}>Scanned VIN: {vin}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={() => setVin(null)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => scanVIN(vin)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Register Vehicle</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.scanText}>Point camera at VIN barcode</Text>
          )}
        </View>

        {queuedVins.length > 0 && (
          <TouchableOpacity 
            style={[styles.syncButton]} 
            onPress={syncQueuedVins}
            disabled={isSubmitting}
          >
            <Text style={styles.syncButtonText}>
              Sync Queued VINs ({queuedVins.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Recently scanned vehicles */}
      {scannedVehicles.length > 0 && (
        <View style={styles.scannedContainer}>
          <Text style={styles.scannedTitle}>
            Recently Scanned Vehicles ({scannedVehicles.length})
          </Text>
          <ScrollView style={styles.scannedList}>
            {scannedVehicles.map((vehicle, index) => (
              <View key={index} style={styles.vehicleItem}>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleVin}>
                    VIN: {vehicle.vin}
                  </Text>
                  <Text style={styles.vehicleId}>
                    ID: {vehicle.id}
                  </Text>
                  <Text style={styles.vehicleStatus}>
                    Status: {vehicle.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.fleetButton}
        onPress={navigateToFleetTracker}
      >
        <Text style={styles.fleetButtonText}>
          Go to Fleet Tracker
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    margin: 12,
  },
  camera: {
    flex: 1,
  },
  controls: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
  },
  scanInfo: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scanText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#4287f5',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
  },
  syncButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scannedContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    padding: 16,
    flex: 1,
  },
  scannedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scannedList: {
    flex: 1,
  },
  vehicleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleVin: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  vehicleId: {
    fontSize: 12,
    color: '#666',
  },
  vehicleStatus: {
    fontSize: 12,
    color: '#4287f5',
    marginTop: 4,
  },
  fleetButton: {
    backgroundColor: '#4287f5',
    padding: 16,
    margin: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fleetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});