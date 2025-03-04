import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import useAuth from '../hooks/useAuth';

interface LogoutButtonProps {
  compact?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ compact = false }) => {
  const { logout } = useAuth();

  return (
    <TouchableOpacity 
      style={[styles.button, compact ? styles.compactButton : null]} 
      onPress={logout}
    >
      <Text style={[styles.buttonText, compact ? styles.compactText : null]}>
        {compact ? 'Logout' : 'Sign Out'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  compactButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactText: {
    fontSize: 14,
  },
});

export default LogoutButton;