import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import NetInfo from '@react-native-community/netinfo';

export default function Inspection({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'Inspection'>>) {
  const [inspectionDetails, setInspectionDetails] = useState<string>('');
  const [passed, setPassed] = useState<boolean | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [queuedInspections, setQueuedInspections] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const validateInspection = (): boolean => {
    if (!inspectionDetails.trim()) {
      Alert.alert('Error', 'Please enter inspection details');
      return false;
    }
    if (passed === null) {
      Alert.alert('Error', 'Please select Pass or Fail');
      return false;
    }
    return true;
  };

  const submitInspection = async (): Promise<void> => {
    if (!validateInspection()) return;

    const inspectionData = { details: inspectionDetails, passed };
    if (isOffline) {
      setQueuedInspections(prev => [...prev, JSON.stringify(inspectionData)]);
      Alert.alert('Offline', 'Inspection queued. Will sync when online.');
      resetForm();
      return;
    }

    try {
      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', inspectionData);
      Alert.alert('Success', 'Inspection submitted successfully');
      resetForm();
      navigation.navigate('VINScanner');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Inspection Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          request: axiosError.request,
          config: axiosError.config,
        });
        Alert.alert('Error', 'Failed to submit inspection: ' + axiosError.message);
        setQueuedInspections(prev => [...prev, JSON.stringify(inspectionData)]);
      } else {
        console.error('Unexpected Error:', error);
        Alert.alert('Error', 'Failed to submit inspection: ' + (error instanceof Error ? error.message : String(error)));
        setQueuedInspections(prev => [...prev, JSON.stringify(inspectionData)]);
      }
    }
  };

  const syncQueuedInspections = async (): Promise<void> => {
    if (!isOffline && queuedInspections.length > 0) {
      for (const queued of queuedInspections) {
        try {
          const data = JSON.parse(queued) as { details: string; passed: boolean };
          await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', data);
          setQueuedInspections(prev => prev.filter(q => q !== queued));
          Alert.alert('Success', 'Synced offline inspection');
        } catch (error) {
          console.error('Sync Error:', error);
          Alert.alert('Error', 'Failed to sync offline inspection');
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (!isOffline) syncQueuedInspections();
  }, [isOffline]);

  const resetForm = (): void => {
    setInspectionDetails('');
    setPassed(null);
  };

  return (
    <View style={styles.container}>
      <Text>Pre-Trip Inspection (FMCSA Compliant)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter inspection details (e.g., brakes, tires, lights)"
        value={inspectionDetails}
        onChangeText={setInspectionDetails}
        multiline
        autoCapitalize="sentences"
      />
      <View style={styles.buttons}>
        <Button title="Pass" onPress={() => setPassed(true)} color="green" />
        <Button title="Fail" onPress={() => setPassed(false)} color="red" />
      </View>
      <Button title="Submit" onPress={submitInspection} disabled={!passed && passed !== false} />
      {queuedInspections.length > 0 && (
        <Text style={styles.queueInfo}>Queued Inspections: {queuedInspections.length}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    height: 100,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  queueInfo: {
    marginTop: 10,
    textAlign: 'center',
    color: 'blue',
  },
});