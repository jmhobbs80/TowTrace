import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import NetInfo from '@react-native-community/netinfo';
import { InspectionData } from '../types';

// Type for camera devices
interface CameraDevices {
  back?: CameraDevice;
  front?: CameraDevice;
}

export default function Inspection({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'Inspection'>>) {
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    details: '',
    passed: false,
    tirePressure: '',
    brakes: '',
    lights: '',
    date: new Date().toISOString().split('T')[0],
    photoUris: [],
  });
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queuedInspections, setQueuedInspections] = useState<InspectionData[]>([]);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { token } = useAuth();
  const devices = useCameraDevices() as CameraDevices;
  const device = devices?.back;
  const camera = useRef<Camera>(null);

  useEffect(() => {
    checkCameraPermission();
    
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncQueuedInspections();
      }
    });
    
    return () => unsubscribe();
  }, [queuedInspections]);

  const checkCameraPermission = async (): Promise<void> => {
    const status = await Camera.requestCameraPermission();
    setCameraPermission(status === 'granted');
  };

  const takePicture = async (): Promise<void> => {
    if (!camera.current) return;
    try {
      const photo = await camera.current.takePhoto({
        flash: 'auto',
        quality: 90,
      });
      
      const uri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
      
      setInspectionData(prev => ({
        ...prev,
        photoUris: [...(prev.photoUris || []), uri]
      }));
      
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number): void => {
    setInspectionData(prev => ({
      ...prev,
      photoUris: prev.photoUris?.filter((_, i) => i !== index)
    }));
  };

  const validateInspection = (): boolean => {
    if (!inspectionData.details.trim() || !inspectionData.tirePressure || !inspectionData.brakes || !inspectionData.lights) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }
    return true;
  };

  const submitInspection = async (): Promise<void> => {
    if (!validateInspection()) return;
    
    setIsSubmitting(true);
    
    try {
      const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
      
      if (!isConnected) {
        setQueuedInspections(prev => [...prev, inspectionData]);
        Alert.alert('Offline', 'Inspection queued. Will sync when online.');
        resetForm();
        setIsSubmitting(false);
        return;
      }

      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', {
        jobId: 'current', // This would normally come from your job context
        inspectionType: 'pre-trip',
        passed: inspectionData.passed,
        details: inspectionData.details,
        tirePressure: inspectionData.tirePressure,
        brakes: inspectionData.brakes,
        lights: inspectionData.lights,
        date: inspectionData.date,
        photos: inspectionData.photoUris
      }, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      
      Alert.alert('Success', 'Inspection submitted successfully', [
        { text: 'OK', onPress: () => navigation.navigate('VINScanner') }
      ]);
      
      resetForm();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg('API Error: ' + (error as AxiosError).message);
        console.error('Inspection Submission Error:', {
          message: (error as AxiosError).message,
          status: (error as AxiosError).response?.status,
          data: (error as AxiosError).response?.data,
        });
      } else {
        setErrorMsg('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
        console.error('Unexpected Error:', error);
      }
      
      const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
      
      if (!isConnected) {
        setQueuedInspections(prev => [...prev, inspectionData]);
        Alert.alert('Offline', 'Inspection queued. Will sync when online.');
      } else {
        Alert.alert('Error', errorMsg ?? 'Failed to submit inspection');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncQueuedInspections = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedInspections.length === 0) return;

    for (const queuedInspection of queuedInspections) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', {
          jobId: 'current',
          inspectionType: 'pre-trip',
          passed: queuedInspection.passed,
          details: queuedInspection.details,
          tirePressure: queuedInspection.tirePressure,
          brakes: queuedInspection.brakes,
          lights: queuedInspection.lights,
          date: queuedInspection.date,
          photos: queuedInspection.photoUris
        }, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        
        setQueuedInspections(prev => prev.filter(i => i.date !== queuedInspection.date));
        Alert.alert('Success', `Synced queued inspection for ${queuedInspection.date}`);
      } catch (error: unknown) {
        console.error('Sync Error:', error);
        Alert.alert('Error', 'Failed to sync queued inspection: ' + (error instanceof Error ? error.message : String(error)));
        break; // Stop syncing if an error occurs
      }
    }
  };

  const resetForm = (): void => {
    setInspectionData({
      details: '',
      passed: false,
      tirePressure: '',
      brakes: '',
      lights: '',
      date: new Date().toISOString().split('T')[0],
      photoUris: [],
    });
  };

  // Camera screen
  if (showCamera) {
    if (!cameraPermission) {
      return (
        <View style={styles.centeredContainer}>
          <Text>Camera permission not granted</Text>
          <Button title="Request Permission" onPress={checkCameraPermission} />
          <Button title="Go Back" onPress={() => setShowCamera(false)} />
        </View>
      );
    }
    
    if (!device) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading camera...</Text>
          <Button title="Cancel" onPress={() => setShowCamera(false)} />
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main inspection form
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Pre-Trip Inspection (FMCSA Compliant)</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Inspection</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter inspection details (e.g., general condition)"
            value={inspectionData.details}
            onChangeText={(text) => setInspectionData({ ...inspectionData, details: text })}
            multiline
            autoCapitalize="sentences"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Checks</Text>
          <TextInput
            style={styles.input}
            placeholder="Tire Pressure (e.g., 100 psi)"
            value={inspectionData.tirePressure}
            onChangeText={(text) => setInspectionData({ ...inspectionData, tirePressure: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Brakes (e.g., functional, worn)"
            value={inspectionData.brakes}
            onChangeText={(text) => setInspectionData({ ...inspectionData, brakes: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Lights (e.g., all working, issues)"
            value={inspectionData.lights}
            onChangeText={(text) => setInspectionData({ ...inspectionData, lights: text })}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Button 
            title="Take Photo" 
            onPress={() => setShowCamera(true)} 
          />
          
          {inspectionData.photoUris && inspectionData.photoUris.length > 0 ? (
            <ScrollView horizontal style={styles.photoList}>
              {inspectionData.photoUris.map((uri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyPhotos}>No photos added</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Result</Text>
          <Text style={styles.dateText}>Inspection Date: {inspectionData.date}</Text>
          
          <View style={styles.passFailButtons}>
            <TouchableOpacity 
              style={[
                styles.passFailButton, 
                inspectionData.passed ? styles.passButton : styles.passButtonInactive
              ]} 
              onPress={() => setInspectionData({ ...inspectionData, passed: true })}
            >
              <Text style={styles.passFailButtonText}>Pass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.passFailButton, 
                !inspectionData.passed ? styles.failButton : styles.failButtonInactive
              ]} 
              onPress={() => setInspectionData({ ...inspectionData, passed: false })}
            >
              <Text style={styles.passFailButtonText}>Fail</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, (!inspectionData.passed || isSubmitting) && styles.submitButtonDisabled]} 
          onPress={submitInspection}
          disabled={!inspectionData.passed || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
          )}
        </TouchableOpacity>
        
        {queuedInspections.length > 0 && (
          <Text style={styles.queueInfo}>
            Queued Inspections: {queuedInspections.length}
          </Text>
        )}
        
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 12,
  },
  passFailButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passFailButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  passButton: {
    backgroundColor: '#34C759',
  },
  passButtonInactive: {
    backgroundColor: '#dcf8e5',
  },
  failButton: {
    backgroundColor: '#FF3B30',
  },
  failButtonInactive: {
    backgroundColor: '#ffe0de',
  },
  passFailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoList: {
    flexDirection: 'row',
    marginTop: 12,
    height: 100,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyPhotos: {
    marginTop: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueInfo: {
    marginTop: 10,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '500',
  },
  error: {
    marginTop: 10,
    textAlign: 'center',
    color: 'red',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  cancelButton: {
    position: 'absolute',
    right: 20,
    padding: 15,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
});