import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, useAuth } from '../App'; // Consolidated import
import NetInfo from '@react-native-community/netinfo';

export default function Inspection({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'Inspection'>>) {
  // Define the inspection data type with passed as boolean (not null)
  interface InspectionData {
    details: string;
    passed: boolean;
    tirePressure: string;
    brakes: string;
    lights: string;
    date: string;
  }

  const [inspectionData, setInspectionData] = useState<InspectionData>({
    details: '',
    passed: false, // Default to false instead of null for stricter typing
    tirePressure: '',
    brakes: '',
    lights: '',
    date: new Date().toISOString().split('T')[0], // Default to current date
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queuedInspections, setQueuedInspections] = useState<InspectionData[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncQueuedInspections();
      }
    });
    return () => unsubscribe();
  }, [queuedInspections]);

  const validateInspection = (): boolean => {
    if (!inspectionData.details.trim() || !inspectionData.tirePressure || !inspectionData.brakes || !inspectionData.lights) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }
    // No need to check passed since it's now required (boolean, not null)
    return true;
  };

  const submitInspection = async (): Promise<void> => {
    if (!validateInspection()) return;

    const inspection: InspectionData = { ...inspectionData };
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    try {
      if (!isConnected) {
        setQueuedInspections(prev => [...prev, inspection]);
        Alert.alert('Offline', 'Inspection queued. Will sync when online.');
        resetForm();
        return;
      }

      await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', {
        jobId: 'job1', // Replace with dynamic job ID if needed
        driverId: 'driver1', // Replace with authenticated driver ID
        inspectionType: 'pre-trip',
        passed: inspection.passed,
        details: inspection.details,
        tirePressure: inspection.tirePressure,
        brakes: inspection.brakes,
        lights: inspection.lights,
        date: inspection.date,
      }, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      Alert.alert('Success', 'Inspection submitted successfully');
      resetForm();
      navigation.navigate('VINScanner');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg('API Error: ' + (error as AxiosError).message);
        console.error('Inspection Submission Error:', {
          message: (error as AxiosError).message,
          status: (error as AxiosError).response?.status,
          data: (error as AxiosError).response?.data,
          request: (error as AxiosError).request,
          config: (error as AxiosError).config,
        });
      } else {
        setErrorMsg('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
        console.error('Unexpected Error:', error);
      }
      if (!isConnected) {
        setQueuedInspections(prev => [...prev, inspection]);
        Alert.alert('Offline', 'Inspection queued. Will sync when online.');
      } else {
        Alert.alert('Error', errorMsg ?? 'Failed to submit inspection');
      }
      resetForm();
    }
  };

  const syncQueuedInspections = async (): Promise<void> => {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected ?? false);
    if (!isConnected || queuedInspections.length === 0) return;

    for (const queuedInspection of queuedInspections) {
      try {
        await axios.post('https://towtrace-api.justin-michael-hobbs.workers.dev/inspections/submit', {
          jobId: 'job1',
          driverId: 'driver1',
          inspectionType: 'pre-trip',
          passed: queuedInspection.passed,
          details: queuedInspection.details,
          tirePressure: queuedInspection.tirePressure,
          brakes: queuedInspection.brakes,
          lights: queuedInspection.lights,
          date: queuedInspection.date,
        }, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        setQueuedInspections(prev => prev.filter(i => i.details !== queuedInspection.details));
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
      passed: false, // Default to false instead of null
      tirePressure: '',
      brakes: '',
      lights: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <View style={styles.container}>
      <Text>Pre-Trip Inspection (FMCSA Compliant)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter inspection details (e.g., general condition)"
        value={inspectionData.details}
        onChangeText={(text) => setInspectionData({ ...inspectionData, details: text })}
        multiline
        autoCapitalize="sentences"
      />
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
      <Text>Inspection Date: {inspectionData.date}</Text>
      <View style={styles.buttons}>
        <Button title="Pass" onPress={() => setInspectionData({ ...inspectionData, passed: true })} color="green" />
        <Button title="Fail" onPress={() => setInspectionData({ ...inspectionData, passed: false })} color="red" />
      </View>
      <Button title="Submit" onPress={submitInspection} disabled={!inspectionData.passed} />
      {queuedInspections.length > 0 && <Text style={styles.queueInfo}>Queued Inspections: {queuedInspections.length}</Text>}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
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
  error: {
    marginTop: 10,
    textAlign: 'center',
    color: 'red',
  },
});