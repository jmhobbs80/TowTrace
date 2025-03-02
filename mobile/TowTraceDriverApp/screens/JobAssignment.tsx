import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export default function JobAssignment({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'JobAssignment'>>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Not available in Driver App</Text>
      <Text style={styles.description}>
        The Job Assignment feature is only available in the Dispatcher App.
        Drivers receive job assignments from dispatchers and cannot create or assign jobs themselves.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF3B30',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
  },
});