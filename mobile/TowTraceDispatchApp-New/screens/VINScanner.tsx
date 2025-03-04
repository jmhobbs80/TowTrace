import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import { VehiclePhoto } from '../types';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

const VINScanner: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  const [vinInput, setVinInput] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<{vin: string, photos: VehiclePhoto[]}[]>([]);
  const [recentScans, setRecentScans] = useState<{vin: string, timestamp: string}[]>([]);

  useEffect(() => {
    // Check if camera permission has been granted
    if (!hasPermission) {
      requestPermission();
    }

    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to process offline queue when connectivity returns
      if (state.isConnected) {
        processOfflineQueue();
      }
    });

    // Load offline queue and recent scans from storage
    loadOfflineQueue();
    loadRecentScans();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [hasPermission]);

  const loadOfflineQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem('vinScanOfflineQueue');
      if (queueData) {
        setOfflineQueue(JSON.parse(queueData));
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  };

  const saveOfflineQueue = async (newQueue: {vin: string, photos: VehiclePhoto[]}[]) => {
    try {
      await AsyncStorage.setItem('vinScanOfflineQueue', JSON.stringify(newQueue));
      setOfflineQueue(newQueue);
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  };

  const loadRecentScans = async () => {
    try {
      const scansData = await AsyncStorage.getItem('recentVinScans');
      if (scansData) {
        setRecentScans(JSON.parse(scansData));
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const saveRecentScan = async (vin: string) => {
    try {
      const newScan = { vin, timestamp: new Date().toISOString() };
      const updatedScans = [newScan, ...recentScans.slice(0, 9)]; // Keep only last 10 scans
      await AsyncStorage.setItem('recentVinScans', JSON.stringify(updatedScans));
      setRecentScans(updatedScans);
    } catch (error) {
      console.error('Error saving recent scan:', error);
    }
  };

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    
    setIsUploading(true);
    const newQueue = [...offlineQueue];
    
    for (let i = 0; i < newQueue.length; i++) {
      const item = newQueue[i];
      try {
        await submitVIN(item.vin, item.photos, false);
        newQueue.splice(i, 1);
        i--;
      } catch (error) {
        console.error('Error processing offline item:', error);
        break; // Stop processing if we hit an error (likely still offline)
      }
    }
    
    await saveOfflineQueue(newQueue);
    setIsUploading(false);
  };

  const capturePhoto = async (type: 'front' | 'rear' | 'side' | 'damage') => {
    if (camera.current && isCameraActive) {
      try {
        const photo = await camera.current.takePhoto({
          flash: 'auto',
        });
        
        const newPhoto: VehiclePhoto = {
          uri: `file://${photo.path}`,
          type,
          timestamp: new Date().toISOString()
        };
        
        setPhotos(prev => [...prev, newPhoto]);
        setIsCameraActive(false);
        
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
      }
    }
  };

  const selectPhotoFromLibrary = async (type: 'front' | 'rear' | 'side' | 'damage') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          const newPhoto: VehiclePhoto = {
            uri: asset.uri,
            type,
            timestamp: new Date().toISOString()
          };
          
          setPhotos(prev => [...prev, newPhoto]);
        }
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const submitVIN = async (vin: string, vehiclePhotos: VehiclePhoto[], shouldQueue: boolean = true) => {
    if (!vin.trim()) {
      Alert.alert('Error', 'Please enter a VIN number.');
      return;
    }

    if (!isConnected && shouldQueue) {
      // Add to offline queue
      const newQueue = [...offlineQueue, { vin, photos: vehiclePhotos }];
      await saveOfflineQueue(newQueue);
      await saveRecentScan(vin);
      Alert.alert('Saved Offline', 'VIN data saved to queue and will be uploaded when connectivity returns.');
      
      // Clear form
      setVinInput('');
      setPhotos([]);
      return;
    }

    setIsLoading(true);

    try {
      // Convert photos to base64 if needed or use FormData
      const formData = new FormData();
      formData.append('vin', vin);
      
      vehiclePhotos.forEach((photo, index) => {
        const fileType = photo.uri.endsWith('png') ? 'image/png' : 'image/jpeg';
        const filename = photo.uri.split('/').pop() || `photo_${index}.jpg`;
        
        // @ts-ignore
        formData.append('photos', {
          uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
          name: filename,
          type: fileType,
        });
        
        formData.append(`photoTypes[${index}]`, photo.type);
      });

      await axios.post(`${API_BASE_URL}/vehicles/vin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (shouldQueue) {
        await saveRecentScan(vin);
        Alert.alert('Success', 'VIN data submitted successfully.');
        
        // Clear form
        setVinInput('');
        setPhotos([]);
      }
      
    } catch (error) {
      console.error('Error submitting VIN data:', error);
      if (shouldQueue) {
        Alert.alert(
          'Submission Error',
          'Would you like to save this entry to be uploaded later?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                const newQueue = [...offlineQueue, { vin, photos: vehiclePhotos }];
                await saveOfflineQueue(newQueue);
                await saveRecentScan(vin);
                Alert.alert('Saved', 'VIN data saved to queue.');
                setVinInput('');
                setPhotos([]);
              }
            },
            {
              text: 'No',
              style: 'cancel'
            }
          ]
        );
      } else {
        throw error; // Re-throw for offline queue processing
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentScanSelect = (vin: string) => {
    setVinInput(vin);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Vehicle VIN Scanner</Text>
        
        {isCameraActive && device ? (
          <View style={styles.cameraContainer}>
            <Camera
              ref={camera}
              style={styles.camera}
              device={device}
              isActive={true}
              photo={true}
            />
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={() => capturePhoto('front')}
              >
                <Text style={styles.buttonText}>Front</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={() => capturePhoto('rear')}
              >
                <Text style={styles.buttonText}>Rear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={() => capturePhoto('side')}
              >
                <Text style={styles.buttonText}>Side</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={() => capturePhoto('damage')}
              >
                <Text style={styles.buttonText}>Damage</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cameraButton, styles.cancelButton]} 
                onPress={() => setIsCameraActive(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.label}>VIN Number</Text>
            <TextInput
              style={styles.input}
              value={vinInput}
              onChangeText={setVinInput}
              placeholder="Enter vehicle VIN"
              maxLength={17}
              autoCapitalize="characters"
            />
            
            <Text style={styles.label}>Vehicle Photos (Optional)</Text>
            
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                  <Text style={styles.photoType}>{photo.type}</Text>
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {photos.length < 4 && (
              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => {
                    if (hasPermission) {
                      setIsCameraActive(true);
                    } else {
                      requestPermission();
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => {
                    // Prompt for photo type when selecting from library
                    Alert.alert(
                      'Select Photo Type',
                      'What type of photo are you adding?',
                      [
                        { text: 'Front', onPress: () => selectPhotoFromLibrary('front') },
                        { text: 'Rear', onPress: () => selectPhotoFromLibrary('rear') },
                        { text: 'Side', onPress: () => selectPhotoFromLibrary('side') },
                        { text: 'Damage', onPress: () => selectPhotoFromLibrary('damage') },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, (isLoading || isUploading) ? styles.disabledButton : null]}
                onPress={() => submitVIN(vinInput, photos)}
                disabled={isLoading || isUploading}
              >
                {(isLoading || isUploading) ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit VIN</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {!isConnected && (
              <View style={styles.offlineMessage}>
                <Text style={styles.offlineText}>
                  You are currently offline. VIN data will be saved locally and uploaded when connection is restored.
                </Text>
              </View>
            )}
            
            {offlineQueue.length > 0 && (
              <View style={styles.queueContainer}>
                <Text style={styles.queueTitle}>Offline Queue ({offlineQueue.length})</Text>
                <Text style={styles.queueSubtitle}>
                  {isConnected ? 'Connect to internet to sync data.' : 'Items will upload when connection is restored.'}
                </Text>
              </View>
            )}
          </>
        )}
      </Card>
      
      {recentScans.length > 0 && !isCameraActive && (
        <Card>
          <Text style={styles.recentScansTitle}>Recent VIN Scans</Text>
          
          {recentScans.map((scan, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.recentScanItem}
              onPress={() => handleRecentScanSelect(scan.vin)}
            >
              <Text style={styles.recentScanVin}>{scan.vin}</Text>
              <Text style={styles.recentScanTimestamp}>{formatTimestamp(scan.timestamp)}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}
      
      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('FleetTracker' as never)}
        >
          <Text style={styles.navigationButtonText}>Fleet Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('JobAssignment' as never)}
        >
          <Text style={styles.navigationButtonText}>Job Assignment</Text>
        </TouchableOpacity>
      </View>
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
  label: {
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
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoType: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFFFFF',
    padding: 4,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,59,48,0.8)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
  queueContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  queueTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  queueSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  recentScansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  recentScanItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  recentScanVin: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  recentScanTimestamp: {
    fontSize: 14,
    color: '#8E8E93',
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
});

export default VINScanner;