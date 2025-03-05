import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../TowTraceDriverApp-New/hooks/useAuth';

interface UserAccountMenuProps {
  userRole?: 'driver' | 'dispatcher';
  userName?: string;
}

const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  userRole = 'driver',
  userName = 'User',
}) => {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen dimensions for positioning
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    return () => {
      // Clear any lingering timeouts when component unmounts
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  const toggleMenu = () => {
    // Clear any existing timeout
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }

    if (!isMenuOpen) {
      setIsMenuOpen(true);
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsMenuOpen(false);
      });
    }
  };

  const handleMenuMouseEnter = () => {
    // Clear any pending close timeout
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    
    // Open menu if it's not already open
    if (!isMenuOpen) {
      toggleMenu();
    }
  };

  const handleMenuMouseLeave = () => {
    // Set timeout to close menu after a delay
    // This allows users to move cursor from button to menu
    menuTimeoutRef.current = setTimeout(() => {
      if (isMenuOpen) {
        toggleMenu();
      }
    }, 300);
  };

  const navigateTo = (screen: string) => {
    toggleMenu();
    navigation.navigate(screen as never);
  };

  const handleLogout = async () => {
    toggleMenu();
    await logout();
    navigation.navigate('Login' as never);
  };

  // Animation values
  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const menuOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View 
      style={styles.container} 
      onTouchStart={handleMenuMouseEnter}
      onTouchEnd={handleMenuMouseLeave}
    >
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>

      {isMenuOpen && (
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [{ translateY: menuTranslateY }],
              opacity: menuOpacity,
              right: userRole === 'driver' ? 10 : 20,
            },
          ]}
          onTouchStart={handleMenuMouseEnter}
          onTouchEnd={handleMenuMouseLeave}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuUserName}>{userName}</Text>
            <Text style={styles.menuUserRole}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Text>
          </View>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateTo('Profile')}
          >
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>
          
          {userRole === 'dispatcher' && (
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigateTo('Settings')}
            >
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateTo('SubscriptionSettings')}
          >
            <Text style={styles.menuItemText}>Subscription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={handleLogout}
          >
            <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  menu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
    overflow: 'hidden',
  },
  menuHeader: {
    padding: 16,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  menuUserRole: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  menuItem: {
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000000',
  },
  logoutItem: {
    backgroundColor: '#F2F2F7',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
});

export default UserAccountMenu;