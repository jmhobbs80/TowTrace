import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';

const JobAssignment: React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Job Assignment</Text>
        <Text style={styles.subtitle}>Not Available in Driver App</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            The Job Assignment feature is only available in the Dispatcher App. 
            This feature allows dispatchers to create and assign jobs to drivers, 
            including setting pickup and dropoff locations, planning routes with 
            multiple stops, and selecting vehicles.
          </Text>
          
          <Text style={styles.infoText}>
            As a driver, you'll receive job assignments through notifications and 
            can view your current job details in the Job Tracker. If you need to 
            discuss job assignments, please contact your dispatcher directly.
          </Text>
        </View>
        
        <View style={styles.navigationButtonsContainer}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => navigation.navigate('JobTracker' as never)}
          >
            <Text style={styles.navigationButtonText}>View Current Job</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => navigation.navigate('VINScanner' as never)}
          >
            <Text style={styles.navigationButtonText}>VIN Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => navigation.navigate('Inspection' as never)}
          >
            <Text style={styles.navigationButtonText}>Vehicle Inspection</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 22,
  },
  navigationButtonsContainer: {
    marginTop: 8,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default JobAssignment;