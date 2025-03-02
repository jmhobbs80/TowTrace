import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { View, Button, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VINScanner from "./screens/VINScanner";
import JobTracker from "./screens/JobTracker";
import Inspection from "./screens/Inspection";
import axios from "axios"; // Remove AxiosError since it's not used

const AuthContext = createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
}>({
  token: null,
  setToken: () => {},
});

export type RootStackParamList = {
  VINScanner: undefined;
  JobTracker: undefined;
  Inspection: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        await axios.get(
          "https://towtrace-api.justin-michael-hobbs.workers.dev/auth/verify",
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        setToken(storedToken);
      } catch (error: unknown) {
        console.error("Auth Check Error:", error);
        localStorage.removeItem("authToken");
        setToken(null);
      }
    }
  };

  const loginWithGoogle = (): void => {
    window.location.href =
      "https://towtrace-api.justin-michael-hobbs.workers.dev/auth/google";
  };

  const authValue = useMemo(() => ({ token, setToken }), [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Button title="Login with Google" onPress={loginWithGoogle} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="VINScanner" component={VINScanner} />
          <Stack.Screen name="JobTracker" component={JobTracker} />
          <Stack.Screen name="Inspection" component={Inspection} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export const useAuth = (): {
  token: string | null;
  setToken: (token: string | null) => void;
} => useContext(AuthContext);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
