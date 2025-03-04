import React, {
  useState,
  useEffect,
  createContext,
  useMemo,
} from "react";
import { View, Button, StyleSheet, Alert, Text, Linking, ActivityIndicator, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import VINScanner from "./screens/VINScanner";
import JobTracker from "./screens/JobTracker";
import Inspection from "./screens/Inspection";
import EldDashboard from "./screens/EldDashboard";
import SubscriptionSettings from "./screens/SubscriptionSettings";
import SubscriptionButton from "./components/SubscriptionButton";
import { RootStackParamList, AuthContextType } from "./types";
import { EldService } from "./services/EldService";
import { SubscriptionService } from "./services/SubscriptionService";

// Create the Auth Context with default values
export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoading: true,
  logout: async () => {},
  subscription: 'basic',
  hasEldAccess: false,
});

const Stack = createNativeStackNavigator<RootStackParamList>();

const API_BASE_URL = "https://towtrace-api.justin-michael-hobbs.workers.dev";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"driver" | "dispatcher" | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasEldAccess, setHasEldAccess] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem("authToken");
      
      if (storedToken) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/auth/verify`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );
          
          setToken(storedToken);
          const role = response.data.role as "driver" | "dispatcher";
          setUserRole(role);
          
          // Check if tenant has ELD access
          const eldAccess = await EldService.hasEldAccess();
          setHasEldAccess(eldAccess);
          
          // Get subscription info
          try {
            const subscriptionData = await SubscriptionService.getCurrentSubscription();
            setSubscription(subscriptionData);
          } catch (error) {
            console.error("Error fetching subscription details:", error);
          }
        } catch (error) {
          console.error("Auth Check Error:", error);
          await AsyncStorage.removeItem("authToken");
          setToken(null);
          setUserRole(undefined);
          Alert.alert("Error", "Authentication failed. Please login again.");
        }
      }
    } catch (error) {
      console.error("Auth storage error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("authToken");
      setToken(null);
      setUserRole(undefined);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const loginWithGoogle = (): void => {
    Linking.openURL(`${API_BASE_URL}/auth/google`);
    
    // Listen for deep linking when returning from OAuth
    const handleUrl = ({url}: {url: string}) => {
      // Extract token from URL (depends on your API implementation)
      const token = url.split('token=')[1];
      if (token) {
        AsyncStorage.setItem("authToken", token)
          .then(() => {
            setToken(token);
            checkAuth(); // Verify token and get user role
          })
          .catch((error) => {
            console.error("Token storage error:", error);
            Alert.alert("Error", "Failed to store authentication token.");
          });
      }
    };

    // Set up linking event listener
    const linkingSubscription = Linking.addEventListener('url', handleUrl);
    
    // Clean up event listener after 5 minutes (or adjust as needed)
    setTimeout(() => {
      linkingSubscription.remove();
    }, 300000);
  };

  const authValue = useMemo(
    () => ({ 
      token, 
      setToken, 
      userRole, 
      isLoading, 
      logout,
      subscription: subscription?.plan || 'basic',
      hasEldAccess 
    }),
    [token, userRole, isLoading, subscription, hasEldAccess]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TowTrace Driver</Text>
        <Text style={styles.subtitle}>Transport management for drivers</Text>
        <View style={styles.loginButton}>
          <Button title="Login with Google" onPress={loginWithGoogle} color="#007AFF" />
        </View>
        
        {/* Display app tier badge */}
        {subscription && (
          <View style={[
            styles.tierBadge,
            {
              backgroundColor: subscription?.plan === 'enterprise' 
                ? '#5856D6' 
                : subscription?.plan === 'premium' 
                  ? '#007AFF' 
                  : '#8E8E93'
            }
          ]}>
            <Text style={styles.tierText}>
              {(subscription?.plan || 'Basic').toUpperCase()} TIER
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={userRole === "driver" ? "VINScanner" : "FleetTracker"}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: '#F2F2F7',
            },
          }}
        >
          {userRole === "driver" ? (
            // Driver screens
            <>
              <Stack.Screen 
                name="VINScanner" 
                component={VINScanner} 
                options={{ 
                  title: "Scan Vehicle VIN",
                  headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <SubscriptionButton plan={subscription?.plan || 'basic'} compact={true} />
                      <View style={{ width: 10 }} />
                      <Button
                        onPress={logout}
                        title="Logout"
                        color="#fff"
                      />
                    </View>
                  ),
                }}
              />
              <Stack.Screen 
                name="JobTracker" 
                component={JobTracker} 
                options={{ 
                  title: "Track Job Location",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Stack.Screen 
                name="Inspection" 
                component={Inspection} 
                options={{ 
                  title: "Vehicle Inspection",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Stack.Screen 
                name="EldDashboard" 
                component={EldDashboard} 
                options={{ 
                  title: "ELD Dashboard",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Stack.Screen 
                name="SubscriptionSettings" 
                component={SubscriptionSettings} 
                options={{ 
                  title: "Subscription",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Stack.Screen 
                name="FleetTracker" 
                component={FleetTrackerPlaceholder} 
                options={{ 
                  title: "Fleet Tracker",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Stack.Screen 
                name="JobAssignment" 
                component={JobAssignmentPlaceholder} 
                options={{ 
                  title: "Job Assignment",
                  headerRight: () => (
                    <Button
                      onPress={logout}
                      title="Logout"
                      color="#fff"
                    />
                  ),
                }}
              />
            </>
          ) : (
            // Should redirect to dispatcher app if wrong role
            <Stack.Screen 
              name="FleetTracker" 
              component={WrongAppScreen} 
              options={{ 
                title: "Wrong App",
                headerRight: () => (
                  <Button
                    onPress={logout}
                    title="Logout"
                    color="#fff"
                  />
                ),
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#666666',
    textAlign: 'center',
  },
  loginButton: {
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF3B30',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
  },
  tierBadge: {
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tierText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

// Placeholder components for inaccessible screens in Driver App
const FleetTrackerPlaceholder = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Not Available in Driver App</Text>
    <Text style={styles.placeholderText}>
      The Fleet Tracker feature is only available in the Dispatcher App.
    </Text>
    <Text style={styles.placeholderText}>
      Please contact your dispatcher for fleet management needs.
    </Text>
  </View>
);

const JobAssignmentPlaceholder = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Not Available in Driver App</Text>
    <Text style={styles.placeholderText}>
      The Job Assignment feature is only available in the Dispatcher App.
    </Text>
    <Text style={styles.placeholderText}>
      Please contact your dispatcher for job assignments.
    </Text>
  </View>
);

const WrongAppScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Wrong Application</Text>
    <Text style={styles.placeholderText}>
      You are logged in as a dispatcher but are using the Driver App.
    </Text>
    <Text style={styles.placeholderText}>
      Please use the TowTrace Dispatch App instead.
    </Text>
  </View>
);