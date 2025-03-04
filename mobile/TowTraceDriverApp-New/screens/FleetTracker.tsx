import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';

const FleetTracker: React.FC = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Fleet Tracker</Text>
        <Text style={styles.subtitle}>Not Available in Driver App</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            The Fleet Tracker feature is only available in the Dispatcher App. 
            This feature allows dispatchers to view and manage the entire fleet 
            of vehicles in real-time.
          </Text>
          
          <Text style={styles.infoText}>
            As a driver, you have access to the Job Tracker for tracking your 
            current assigned job, the VIN Scanner for scanning vehicle VINs, 
            and the Vehicle Inspection tool for completing pre-trip inspections.
          </Text>
        </View>
        
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
            <Text style={styles.navigationButtonText}>Job Tracker</Text>
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

export default FleetTracker;