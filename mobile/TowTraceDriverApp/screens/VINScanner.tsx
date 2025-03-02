import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, Code, CodeScannerFrame } from 'react-native-vision-camera';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, useAuth } from '../App'; // Ensure these are defined in App.tsx

export default function VINScanner({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'VINScanner'>>) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [vin, setVin] = useState<string | null>(null);
  const devices = useCameraDevices();
  const { token } = useAuth(); // Use useAuth in a React component or hook context
  const device = devices?.find((device) => device.position === 'back'); // Find the back camera device from the array

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async (): Promise<void> => {
    const status = await Camera.requestCameraPermission();
    console.log('Camera permission status:', status);
    setHasPermission(status === 'granted'); // Use 'granted' instead of 'authorized'
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera access in settings to scan VINs.');
    }
  };
  const scanVIN = async (barcodeData: string, token: string | undefined): Promise<void> => {
    if (!barcodeData) return;
    try {
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
    }
  };

  if (!hasPermission) return <Text>Camera permission denied</Text>;
  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={{
          codeTypes: ['ean-13', 'qr'], // Add the required codeTypes property
          onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
            console.log('Scanned codes:', codes);
            if (codes.length > 0) {
              scanVIN(codes[0].value ?? '', token ?? undefined); // Access the first code's value
            }
          },
        }}
      />
      {vin && <Text>Scanned VIN: {vin}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});