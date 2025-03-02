import React, {
  useState,
  useEffect,
  createContext,
  useMemo,
} from "react";
import { View, Button, StyleSheet, Alert, Text, Linking, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VINScanner from "./screens/VINScanner";
import JobTracker from "./screens/JobTracker";
import Inspection from "./screens/Inspection";
import FleetTracker from "./screens/FleetTracker";
import JobAssignment from "./screens/JobAssignment";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "./types";

// Define the Auth Context type
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userRole?: "driver" | "dispatcher";
  isLoading: boolean;
  logout: () => Promise<void>;
}

// Create the Auth Context with default values
export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoading: true,
  logout: async () => {},
});

const Stack = createNativeStackNavigator<RootStackParamList>();

const API_BASE_URL = "https://towtrace-api.justin-michael-hobbs.workers.dev";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"driver" | "dispatcher" | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        } catch (error: unknown) {
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
          .catch(error => {
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
    () => ({ token, setToken, userRole, isLoading, logout }),
    [token, userRole, isLoading]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TowTrace Driver App</Text>
        <Button title="Login with Google" onPress={loginWithGoogle} />
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
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => (
              <Button
                onPress={logout}
                title="Logout"
                color="#fff"
              />
            ),
          }}
        >
          {userRole === "driver" ? (
            // Driver screens
            <>
              <Stack.Screen 
                name="VINScanner" 
                component={VINScanner} 
                options={{ title: "Scan Vehicle VIN" }}
              />
              <Stack.Screen 
                name="JobTracker" 
                component={JobTracker} 
                options={{ title: "Track Job Location" }}
              />
              <Stack.Screen 
                name="Inspection" 
                component={Inspection} 
                options={{ title: "Vehicle Inspection" }}
              />
              <Stack.Screen 
                name="FleetTracker" 
                component={FleetTrackerPlaceholder} 
                options={{ title: "Fleet Tracker (Unavailable)" }}
              />
              <Stack.Screen 
                name="JobAssignment" 
                component={JobAssignmentPlaceholder} 
                options={{ title: "Job Assignment (Unavailable)" }}
              />
            </>
          ) : (
            // Dispatcher screens (should be redirected to dispatcher app)
            <>
              <Stack.Screen 
                name="FleetTracker" 
                component={FleetTracker} 
                options={{ title: "Fleet Tracker" }}
              />
              <Stack.Screen 
                name="JobAssignment" 
                component={JobAssignment} 
                options={{ title: "Job Assignment" }}
              />
              <Stack.Screen 
                name="VINScanner" 
                component={VINScanner} 
                options={{ title: "Scan Vehicle VIN" }}
              />
              <Stack.Screen 
                name="JobTracker" 
                component={JobTracker} 
                options={{ title: "Track Job Location" }}
              />
              <Stack.Screen 
                name="Inspection" 
                component={Inspection} 
                options={{ title: "Vehicle Inspection" }}
              />
            </>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

// Placeholder components for inaccessible screens in Driver App
const FleetTrackerPlaceholder = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Not available in Driver App</Text>
    <Text>The Fleet Tracker feature is only available in the Dispatcher App.</Text>
  </View>
);

const JobAssignmentPlaceholder = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Not available in Driver App</Text>
    <Text>The Job Assignment feature is only available in the Dispatcher App.</Text>
  </View>
);