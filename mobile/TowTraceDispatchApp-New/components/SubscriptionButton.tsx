import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface SubscriptionButtonProps {
  plan?: string;
  compact?: boolean;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ plan = 'basic', compact = false }) => {
  const navigation = useNavigation();
  
  const handlePress = () => {
    navigation.navigate('SubscriptionSettings' as never);
  };
  
  const getPlanColor = (planName: string): string => {
    switch (planName.toLowerCase()) {
      case 'enterprise':
        return '#5856D6'; // Purple
      case 'premium':
        return '#007AFF'; // Blue
      case 'basic':
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getPlanColor(plan) },
        compact ? styles.compactContainer : null
      ]}
      onPress={handlePress}
    >
      {compact ? (
        <Text style={styles.compactText}>{plan.slice(0, 1).toUpperCase()}</Text>
      ) : (
        <Text style={styles.text}>{plan.toUpperCase()}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  compactText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default SubscriptionButton;