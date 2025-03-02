import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, Code, CodeScannerFrame } from 'react-native-vision-camera';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, useAuth } from '../App'; // Consolidated import
import NetInfo from '@react-native-community/netinfo';

// Define the type for useCameraDevices return value
interface CameraDevices {
  back?: CameraDevice;
  front?: CameraDevice;
  // Add other camera positions as needed (e.g., external)
}

export default function VINScanner({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'VINScanner'>>) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [vin, setVin] = useState<string | null>(null);
  const [queuedScans, setQueuedScans] = useState<string[]>([]);
  const devices = useCameraDevices() as CameraDevices; // Cast to our custom type
  const { token } = useAuth(); // Use useAuth in a React component or hook context
  const device = devices?.back; // Use 'back' directly, type-casted for safety

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async (): Promise<void> => {
    const status = await Camera.requestCameraPermission();
    console.log('Camera permission status:', status);
    setHasPermission(status === 'granted'); // Use string value 'granted' (simplified for compatibility)
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera access in settings to scan VINs.');
    }
  };

  const scanVIN = async (barcodeData: string): Promise<void> => {
    if (!barcodeData || barcodeData.length !== 17) {
      Alert.alert('Error', 'Invalid VIN format. VIN must be 17 characters.');
      return;
    }
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    try {
      if (!isConnected) {
        setQueuedScans(prev => [...prev, barcodeData]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
        return;
      }
      setVin(barcodeData);
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/vin/scan', { vin: barcodeData }, {
        headers: { Authorization: `Bearer ${token ?? ''}` }, // Handle undefined token
      });
      Alert.alert('Success', 'VIN Scanned and Saved: ' + barcodeData);
      navigation.navigate('JobTracker');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('VIN Scan Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          request: axiosError.request,
          config: axiosError.config,
        });
        Alert.alert('Error', 'Failed to scan VIN: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to scan VIN: ' + (error instanceof Error ? error.message : String(error)));
      }
      if (!isConnected) {
        setQueuedScans(prev => [...prev, barcodeData]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
      }
    }
  };

  const syncQueuedScans = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedScans.length === 0) return;

    for (const queuedVin of queuedScans) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/vin/scan', { vin: queuedVin }, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        setQueuedScans(prev => prev.filter(vin => vin !== queuedVin));
        Alert.alert('Success', `Synced queued VIN: ${queuedVin}`);
      } catch (error: unknown) {
        console.error('Sync Error:', error);
        Alert.alert('Error', 'Failed to sync queued VIN: ' + (error instanceof Error ? error.message : String(error)));
        break; // Stop syncing if an error occurs
      }
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncQueuedScans();
      }
    });
    return () => unsubscribe();
  }, [queuedScans]);

  if (!hasPermission) return <Text>Camera permission denied</Text>;
  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={{
          codeTypes: ['code-39', 'qr', 'ean-13'], // Use kebab-case for codeTypes (e.g., 'code-39')
          onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
            console.log('Scanned codes:', codes);
            if (codes.length > 0) {
              scanVIN(codes[0].value ?? '');
            }
          },
        }}
      />
      {vin && <Text>Scanned VIN: {vin}</Text>}
      {queuedScans.length > 0 && <Text style={styles.queueInfo}>Queued VIN Scans: {queuedScans.length}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueInfo: {
    marginTop: 10,
    textAlign: 'center',
    color: 'blue',
  },
});
