import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

const Card: React.FC<CardProps> = ({ children, style, elevation = 2 }) => {
  return (
    <View style={[styles.card, { shadowOpacity: elevation * 0.05 }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
});

export default Card;