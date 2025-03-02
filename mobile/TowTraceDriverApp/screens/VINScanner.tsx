import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Button, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { Camera, useCameraDevices, CameraDevice, Code, CodeScannerFrame } from 'react-native-vision-camera';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import NetInfo from '@react-native-community/netinfo';
import { VehiclePhoto } from '../types';

// Define the type for useCameraDevices return value
interface CameraDevices {
  back?: CameraDevice;
  front?: CameraDevice;
}

export default function VINScanner({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'VINScanner'>>) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [vin, setVin] = useState<string | null>(null);
  const [queuedScans, setQueuedScans] = useState<{ vin: string, photos?: VehiclePhoto[] }[]>([]);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [cameraMode, setCameraMode] = useState<'scan' | 'photo'>('scan');
  const [photoType, setPhotoType] = useState<'front' | 'rear' | 'side' | 'damage'>('front');
  
  const devices = useCameraDevices() as CameraDevices;
  const { token } = useAuth();
  const device = devices?.back;
  const camera = useRef<Camera>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async (): Promise<void> => {
    const status = await Camera.requestCameraPermission();
    console.log('Camera permission status:', status);
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera access in settings to scan VINs.');
    }
  };

  const takePicture = async (): Promise<void> => {
    if (!camera.current) return;
    try {
      const photo = await camera.current.takePhoto({
        flash: 'auto',
        quality: 90,
      });
      
      // Create photo record
      const newPhoto: VehiclePhoto = {
        uri: Platform.OS === 'android' ? `file://${photo.path}` : photo.path,
        type: photoType,
        timestamp: new Date().toISOString(),
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      Alert.alert('Success', `Photo of ${photoType} taken successfully.`);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
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
        setQueuedScans(prev => [...prev, { vin: barcodeData, photos }]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
        return;
      }
      
      // Upload the VIN and photos
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/vin/scan', 
        { 
          vin: barcodeData,
          photos: photos.map(p => ({
            uri: p.uri,
            type: p.type,
            timestamp: p.timestamp
          }))
        }, 
        {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }
      );
      
      Alert.alert('Success', `VIN Scanned and Saved: ${barcodeData}\nPhotos: ${photos.length}`);
      navigation.navigate('JobTracker');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('VIN Scan Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        Alert.alert('Error', 'Failed to scan VIN: ' + axiosError.message);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to scan VIN: ' + (error instanceof Error ? error.message : String(error)));
      }
      
      if (!isConnected) {
        setQueuedScans(prev => [...prev, { vin: barcodeData, photos }]);
        Alert.alert('Offline', 'VIN scan queued. Will sync when online.');
      }
    }
  };

  const syncQueuedScans = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedScans.length === 0) return;

    for (const queuedScan of queuedScans) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/vin/scan', 
          { 
            vin: queuedScan.vin,
            photos: queuedScan.photos?.map(p => ({
              uri: p.uri,
              type: p.type,
              timestamp: p.timestamp
            }))
          }, 
          {
            headers: { Authorization: `Bearer ${token ?? ''}` },
          }
        );
        
        setQueuedScans(prev => prev.filter(scan => scan.vin !== queuedScan.vin));
        Alert.alert('Success', `Synced queued VIN: ${queuedScan.vin}`);
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

  const removePhoto = (index: number): void => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!vin) {
      Alert.alert('Error', 'Please scan a VIN first');
      return;
    }
    
    await scanVIN(vin); // This will handle online/offline logic
    
    // Reset photos after submission
    setPhotos([]);
    setVin(null);
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
          photo={true}
          codeScanner={cameraMode === 'scan' ? {
            codeTypes: ['code-39', 'qr', 'ean-13', 'code-128', 'pdf-417', 'aztec'],
            onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
              if (codes.length > 0 && !vin) {
                setVin(codes[0].value ?? '');
              }
            },
          } : undefined}
        />
      </View>
      
      <View style={styles.controls}>
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'scan' && styles.activeMode]} 
            onPress={() => setCameraMode('scan')}
          >
            <Text style={styles.modeButtonText}>Scan VIN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'photo' && styles.activeMode]} 
            onPress={() => setCameraMode('photo')}
          >
            <Text style={styles.modeButtonText}>Take Photos</Text>
          </TouchableOpacity>
        </View>
        
        {cameraMode === 'scan' ? (
          <View style={styles.scanInfo}>
            {vin ? (
              <>
                <Text style={styles.scanText}>Scanned VIN: {vin}</Text>
                <Button title="Clear" onPress={() => setVin(null)} />
              </>
            ) : (
              <Text style={styles.scanText}>Point camera at VIN barcode</Text>
            )}
          </View>
        ) : (
          <View style={styles.photoControls}>
            <View style={styles.photoTypeSelector}>
              {(['front', 'rear', 'side', 'damage'] as const).map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.photoTypeButton, photoType === type && styles.activePhotoType]} 
                  onPress={() => setPhotoType(type)}
                >
                  <Text style={styles.photoTypeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.captureButtonText}>Capture {photoType}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Photos preview */}
      {photos.length > 0 && (
        <View style={styles.photoPreviewContainer}>
          <Text style={styles.photoPreviewTitle}>Vehicle Photos ({photos.length}/4)</Text>
          <ScrollView horizontal style={styles.photoScroller}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoPreview}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                <Text style={styles.photoTypeLabel}>{photo.type}</Text>
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <Button 
          title="Submit & Continue"
          onPress={handleSubmit}
          disabled={!vin}
        />
        {queuedScans.length > 0 && (
          <Text style={styles.queueInfo}>
            Queued VIN Scans: {queuedScans.length}
          </Text>
        )}
      </View>
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
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  activeMode: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  scanInfo: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scanText: {
    fontSize: 16,
    marginBottom: 8,
  },
  photoControls: {
    alignItems: 'center',
  },
  photoTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photoTypeButton: {
    padding: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activePhotoType: {
    backgroundColor: '#34C759',
  },
  photoTypeText: {
    fontWeight: '600',
  },
  captureButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  captureButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  photoPreviewContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
  },
  photoPreviewTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  photoScroller: {
    flexGrow: 0,
    height: 100,
  },
  photoPreview: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  photoTypeLabel: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
    paddingVertical: 2,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
    alignItems: 'center',
  },
  queueInfo: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
});