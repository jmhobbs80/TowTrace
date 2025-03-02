import React from 'react';
import { View, Text } from 'react-native';
import MapView from 'react-native-maps';

export default function FleetTracker() {
  return (
    <View>
      <MapView
        style={{ width: '100%', height: 400 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
      <Text>Fleet Tracking</Text>
    </View>
  );
}