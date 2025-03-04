import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Card from '../components/Card';
import { InspectionData } from '../types';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

const Inspection: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState<InspectionData>({
    details: '',
    passed: false,
    tirePressure: '',
    brakes: '',
    lights: '',
    date: new Date().toISOString().split('T')[0],
    photoUris: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [offlineInspections, setOfflineInspections] = useState<InspectionData[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to sync offline data when connectivity returns
      if (state.isConnected && offlineInspections.length > 0) {
        syncOfflineData();
      }
    });

    // Load offline inspections from storage
    loadOfflineInspections();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  const loadOfflineInspections = async () => {
    try {
      const offlineData = await AsyncStorage.getItem('inspectionOfflineData');
      if (offlineData) {
        const inspections = JSON.parse(offlineData) as InspectionData[];
        setOfflineInspections(inspections);
      }
    } catch (error) {
      console.error('Error loading offline inspections:', error);
    }
  };

  const saveOfflineInspections = async (inspections: InspectionData[]) => {
    try {
      await AsyncStorage.setItem('inspectionOfflineData', JSON.stringify(inspections));
      setOfflineInspections(inspections);
    } catch (error) {
      console.error('Error saving offline inspections:', error);
    }
  };

  const syncOfflineData = async () => {
    if (offlineInspections.length === 0) return;
    
    setIsSyncing(true);
    try {
      // Process each offline inspection
      for (const inspection of offlineInspections) {
        await submitInspection(inspection, false);
      }
      
      // Clear offline data after successful sync
      await saveOfflineInspections([]);
      
      Alert.alert('Sync Complete', `${offlineInspections.length} inspections synced successfully.`);
    } catch (error) {
      console.error('Error syncing offline data:', error);
      Alert.alert('Sync Failed', 'Unable to sync offline inspections. Will try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInputChange = (field: keyof InspectionData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          const photoUris = formData.photoUris || [];
          setFormData(prev => ({
            ...prev,
            photoUris: [...photoUris, asset.uri].filter(Boolean) as string[]
          }));
        }
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = [...(formData.photoUris || [])];
    updatedPhotos.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      photoUris: updatedPhotos
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.tirePressure.trim()) {
      Alert.alert('Error', 'Tire pressure is required');
      return false;
    }
    
    if (!formData.brakes.trim()) {
      Alert.alert('Error', 'Brakes status is required');
      return false;
    }
    
    if (!formData.lights.trim()) {
      Alert.alert('Error', 'Lights status is required');
      return false;
    }
    
    return true;
  };

  const submitInspection = async (data: InspectionData, shouldQueue: boolean = true) => {
    if (!isConnected && shouldQueue) {
      // Add to offline queue
      const newOfflineInspections = [...offlineInspections, data];
      await saveOfflineInspections(newOfflineInspections);
      Alert.alert('Saved Offline', 'Inspection saved to queue and will be uploaded when connectivity returns.');
      
      // Reset form
      setFormData({
        details: '',
        passed: false,
        tirePressure: '',
        brakes: '',
        lights: '',
        date: new Date().toISOString().split('T')[0],
        photoUris: []
      });
      
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert photos to FormData
      const formData = new FormData();
      
      // Add inspection data
      formData.append('details', data.details);
      formData.append('passed', String(data.passed));
      formData.append('tirePressure', data.tirePressure);
      formData.append('brakes', data.brakes);
      formData.append('lights', data.lights);
      formData.append('date', data.date);
      
      // Add photos if any
      if (data.photoUris && data.photoUris.length > 0) {
        data.photoUris.forEach((uri, index) => {
          const fileType = uri.endsWith('png') ? 'image/png' : 'image/jpeg';
          const filename = uri.split('/').pop() || `photo_${index}.jpg`;
          
          // @ts-ignore
          formData.append('photos', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: filename,
            type: fileType,
          });
        });
      }

      await axios.post(`${API_BASE_URL}/inspections`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (shouldQueue) {
        Alert.alert('Success', 'Inspection submitted successfully.');
        
        // Reset form
        setFormData({
          details: '',
          passed: false,
          tirePressure: '',
          brakes: '',
          lights: '',
          date: new Date().toISOString().split('T')[0],
          photoUris: []
        });
      }
      
    } catch (error) {
      console.error('Error submitting inspection:', error);
      if (shouldQueue) {
        Alert.alert(
          'Submission Error',
          'Would you like to save this inspection to be uploaded later?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                const newOfflineInspections = [...offlineInspections, data];
                await saveOfflineInspections(newOfflineInspections);
                Alert.alert('Saved', 'Inspection saved to queue.');
                
                // Reset form
                setFormData({
                  details: '',
                  passed: false,
                  tirePressure: '',
                  brakes: '',
                  lights: '',
                  date: new Date().toISOString().split('T')[0],
                  photoUris: []
                });
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
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      submitInspection(formData);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Vehicle Inspection</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.readonlyInput}
            value={formData.date}
            editable={false}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Inspection Passed</Text>
          <Switch
            value={formData.passed}
            onValueChange={(value) => handleInputChange('passed', value)}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={formData.passed ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tire Pressure <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.tirePressure}
            onChangeText={(value) => handleInputChange('tirePressure', value)}
            placeholder="Enter tire pressure readings"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Brakes Status <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.brakes}
            onChangeText={(value) => handleInputChange('brakes', value)}
            placeholder="Enter brakes status"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Lights Status <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.lights}
            onChangeText={(value) => handleInputChange('lights', value)}
            placeholder="Enter lights status"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Details</Text>
          <TextInput
            style={styles.textArea}
            value={formData.details}
            onChangeText={(value) => handleInputChange('details', value)}
            placeholder="Enter any additional inspection details"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Photos (Optional)</Text>
          
          <View style={styles.photoGrid}>
            {formData.photoUris?.map((uri, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photoThumbnail} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {(!formData.photoUris || formData.photoUris.length < 4) && (
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={addPhoto}
            >
              <Text style={styles.addPhotoButtonText}>+ Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
          )}
        </TouchableOpacity>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Inspection will be saved locally and uploaded when connection is restored.
            </Text>
          </View>
        )}
        
        {offlineInspections.length > 0 && (
          <View style={styles.syncContainer}>
            <Text style={styles.syncText}>
              {offlineInspections.length} inspections waiting to sync
            </Text>
            {isConnected && (
              <TouchableOpacity 
                style={styles.syncButton}
                onPress={syncOfflineData}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
      
      <View style={styles.navigationButtonsContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('VINScanner' as never)}
        >
          <Text style={styles.navigationButtonText}>VIN Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => navigation.navigate('JobTracker' as never)}
        >
          <Text style={styles.navigationButtonText}>Job Tracking</Text>
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
  },
  readonlyInput: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    fontSize: 16,
    color: '#8E8E93',
  },
  textArea: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  addPhotoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addPhotoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
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
  syncContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncText: {
    flex: 1,
    color: '#000000',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
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

export default Inspection;