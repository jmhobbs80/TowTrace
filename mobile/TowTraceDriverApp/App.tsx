import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { View, Button, StyleSheet, Alert, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VINScanner from "./screens/VINScanner"; // For drivers
import JobTracker from "./screens/JobTracker"; // For drivers
import Inspection from "./screens/Inspection"; // For drivers
import axios from "axios";
import { RootStackParamList } from "../types"; // Import RootStackParamList from a shared types file

const AuthContext = createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  userRole?: "driver" | "dispatcher";
}>({
  token: null,
  setToken: () => {},
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"driver" | "dispatcher" | undefined>(
    undefined
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const response = await axios.get(
          "https://towtrace-api.justin-michael-hobbs.workers.dev/auth/verify",
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        setToken(storedToken);
        const role = response.data.role as "driver" | "dispatcher"; // Adjust based on your API response
        setUserRole(role);
      } catch (error: unknown) {
        console.error("Auth Check Error:", error);
        localStorage.removeItem("authToken");
        setToken(null);
        setUserRole(undefined);
        Alert.alert("Error", "Authentication failed. Please login again.");
      }
    }
  };

  const loginWithGoogle = (): void => {
    window.location.href =
      "https://towtrace-api.justin-michael-hobbs.workers.dev/auth/google";
  };


  const authValue = useMemo(
    () => ({ token, setToken, userRole }),
    [token, userRole]
  );

  if (!token) {
    return (
      <View style={styles.container}>
        <Button title="Login with Google" onPress={loginWithGoogle} />
      </View>
    );
  }

  let renderScreens;
  if (userRole === "driver") {
    renderScreens = (
      <>
        <Stack.Screen name="VINScanner" component={VINScanner} />
        <Stack.Screen name="JobTracker" component={JobTracker} />
        <Stack.Screen name="Inspection" component={Inspection} />
      </>
    );
  } else if (userRole === "dispatcher") {
    renderScreens = (
      <>
        <Stack.Screen
          name="FleetTracker"
          component={FleetTrackerPlaceholder}
        />
        <Stack.Screen
          name="JobAssignment"
          component={JobAssignmentPlaceholder}
        />
      </>
    );
  } else {
    renderScreens = (
      <Stack.Screen
        name="Login"
        component={LoadingScreen}
      />
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        <Stack.Navigator>
          {renderScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export const useAuth = (): {
  token: string | null;
  setToken: (token: string | null) => void;
  userRole?: "driver" | "dispatcher";
} => useContext(AuthContext);
export type { RootStackParamList };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
const FleetTrackerPlaceholder = () => (
  <View>
    <Text>FleetTracker not available in Driver App</Text>
  </View>
);

const JobAssignmentPlaceholder = () => (
  <View>
    <Text>JobAssignment not available in Driver App</Text>
  </View>
);

const LoadingScreen = () => (
  <View>
    <Text>Loading...</Text>
  </View>
);
