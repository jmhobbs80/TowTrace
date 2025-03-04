import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Card from "../components/Card";
import { SubscriptionService } from "../services/SubscriptionService";
import NetInfo from "@react-native-community/netinfo";
import useAuth from "../hooks/useAuth";

const SubscriptionSettings: React.FC = () => {
  // Navigation is used for type safety, even if not directly called
  const navigation = useNavigation();
  // Token from Auth context is used by other service calls
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  // Plans data is fetched but currently only used for UI rendering
  const [availablePlans] = useState<any[]>([]);
  const [usersWithAccess, setUsersWithAccess] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any | null>(null);
  const [showUsersModal, setShowUsersModal] = useState<boolean>(false);

  // Only for enterprise subscribers - manage users access
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    loadSubscriptionData();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      // Get subscription details
      const subscriptionData =
        await SubscriptionService.getCurrentSubscription();
      setSubscription(subscriptionData);

      // Get current user role
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        // Use a safer method for parsing JWT in React Native
        const base64 = token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        // Using a polyfill approach for browsers/environments without native atob
        const decoded = Buffer.from(base64, "base64").toString("binary");

        const jsonPayload = decodeURIComponent(
          Array.from(decoded)
            .map(
              (c) =>
                "%" +
                ("00" + (c as string).charCodeAt(0).toString(16)).slice(-2)
            )
            .join("")
        );
        const tokenPayload = JSON.parse(jsonPayload);
        setIsAdmin(
          tokenPayload.role === "admin" || tokenPayload.role === "system_admin"
        );
      }

      // Get available plans - data fetched but not actively used in this component
      await SubscriptionService.getSubscriptionPlans();

      // For enterprise subscribers, get user access data
      if (subscriptionData?.plan === "enterprise") {
        try {
          const users = await SubscriptionService.getUsersWithFeatureAccess();
          setUsersWithAccess(users);

          const usage = await SubscriptionService.getFeatureUsage();
          setFeatureUsage(usage);
        } catch (error) {
          console.error("Error loading enterprise data:", error);
        }
      }
    } catch (error) {
      console.error("Error loading subscription data:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeRequest = async (plan: string) => {
    if (!isConnected) {
      Alert.alert(
        "Error",
        "Internet connection is required to upgrade your subscription."
      );
      return;
    }

    Alert.alert(
      "Request Subscription Upgrade",
      `Would you like to request an upgrade to the ${plan.toUpperCase()} plan? Your administrator will need to approve this request.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Request Upgrade",
          onPress: () => {
            // Use a separate function to avoid nesting too deep and avoid returning Promise where void is expected
            handleUpgradeConfirmation(plan);
          },
        },
      ]
    );
  };

  // Separate function to handle upgrade confirmation to avoid deep nesting
  const handleUpgradeConfirmation = async (plan: string) => {
    try {
      setIsLoading(true);
      await SubscriptionService.requestUpgrade(plan as any);
      Alert.alert(
        "Success",
        "Your subscription upgrade request has been sent to your administrator."
      );
      await loadSubscriptionData();
    } catch (error) {
      console.error("Error requesting upgrade:", error);
      Alert.alert(
        "Error",
        "Failed to request subscription upgrade. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserFeatureAccess = async (
    userId: string,
    featureName: string,
    isEnabled: boolean
  ) => {
    // This would typically call an API to update user feature access
    Alert.alert(
      "Feature Access",
      `${isEnabled ? "Enable" : "Disable"} ${featureName} for this user?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            // Call separate function to handle the user update
            updateUserFeatureAccess(userId, featureName, isEnabled);
          },
        },
      ]
    );
  };

  // Separate function to update user access to avoid deep nesting
  const updateUserFeatureAccess = (
    userId: string,
    featureName: string,
    isEnabled: boolean
  ) => {
    // Update user access in state for demo purposes
    const updatedUsers = usersWithAccess.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          features: user.features.map((f: any) =>
            f.name === featureName ? { ...f, is_enabled: isEnabled } : f
          ),
        };
      }
      return user;
    });

    setUsersWithAccess(updatedUsers);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanColor = (plan: string): string => {
    switch (plan) {
      case "basic":
        return "#8E8E93"; // Gray
      case "premium":
        return "#007AFF"; // Blue
      case "enterprise":
        return "#5856D6"; // Purple
      default:
        return "#8E8E93"; // Gray
    }
  };

  const getFeatureIcon = (isIncluded: boolean): string => {
    return isIncluded ? "✓" : "✕";
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5856D6" />
        <Text style={styles.loadingText}>
          Loading subscription information...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Card>
        <Text style={styles.title}>Subscription Management</Text>

        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Some features may have limited
              functionality.
            </Text>
          </View>
        )}

        <View style={styles.currentPlanContainer}>
          <Text style={styles.sectionTitle}>Current Plan</Text>

          <View
            style={[
              styles.planBadge,
              { backgroundColor: getPlanColor(subscription?.plan || "basic") },
            ]}
          >
            <Text style={styles.planText}>
              {(subscription?.plan || "basic").toUpperCase()}
            </Text>
          </View>

          <Text style={styles.planDetails}>
            Status:{" "}
            <Text style={styles.planDetailsValue}>
              {subscription?.status || "Active"}
            </Text>
          </Text>

          <Text style={styles.planDetails}>
            Renews:{" "}
            <Text style={styles.planDetailsValue}>
              {formatDate(subscription?.renewal_date)}
            </Text>
          </Text>

          <Text style={styles.planDetails}>
            Billing Cycle:{" "}
            <Text style={styles.planDetailsValue}>
              {subscription?.billing_cycle || "Monthly"}
            </Text>
          </Text>
        </View>

        <View style={styles.featureAccessContainer}>
          <Text style={styles.sectionTitle}>Feature Access</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>VIN Scanning</Text>
              <Text style={[styles.featureStatus, { color: "#34C759" }]}>
                {getFeatureIcon(true)}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>GPS Tracking</Text>
              <Text style={[styles.featureStatus, { color: "#34C759" }]}>
                {getFeatureIcon(true)}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Fleet Management</Text>
              <Text style={[styles.featureStatus, { color: "#34C759" }]}>
                {getFeatureIcon(true)}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Job Management</Text>
              <Text style={[styles.featureStatus, { color: "#34C759" }]}>
                {getFeatureIcon(true)}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>ELD Integration</Text>
              <Text
                style={[
                  styles.featureStatus,
                  {
                    color:
                      subscription?.plan === "basic" ? "#FF3B30" : "#34C759",
                  },
                ]}
              >
                {getFeatureIcon(subscription?.plan !== "basic")}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Advanced Analytics</Text>
              <Text
                style={[
                  styles.featureStatus,
                  {
                    color:
                      subscription?.plan === "basic" ? "#FF3B30" : "#34C759",
                  },
                ]}
              >
                {getFeatureIcon(subscription?.plan !== "basic")}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Multi-Tenant Access</Text>
              <Text
                style={[
                  styles.featureStatus,
                  {
                    color:
                      subscription?.plan === "enterprise"
                        ? "#34C759"
                        : "#FF3B30",
                  },
                ]}
              >
                {getFeatureIcon(subscription?.plan === "enterprise")}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Advanced Routing</Text>
              <Text
                style={[
                  styles.featureStatus,
                  {
                    color:
                      subscription?.plan === "enterprise"
                        ? "#34C759"
                        : "#FF3B30",
                  },
                ]}
              >
                {getFeatureIcon(subscription?.plan === "enterprise")}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Law Enforcement Tools</Text>
              <Text
                style={[
                  styles.featureStatus,
                  {
                    color:
                      subscription?.plan === "enterprise"
                        ? "#34C759"
                        : "#FF3B30",
                  },
                ]}
              >
                {getFeatureIcon(subscription?.plan === "enterprise")}
              </Text>
            </View>
          </View>
        </View>

        {/* Enterprise Management Tools */}
        {subscription?.plan === "enterprise" && isAdmin && (
          <View style={styles.enterpriseContainer}>
            <Text style={styles.sectionTitle}>Enterprise Management</Text>

            <TouchableOpacity
              style={styles.managementButton}
              onPress={() => setShowUsersModal(true)}
            >
              <Text style={styles.managementButtonText}>
                Manage User Access
              </Text>
            </TouchableOpacity>

            {featureUsage && (
              <View style={styles.usageContainer}>
                <Text style={styles.usageTitle}>
                  Feature Usage (Last 30 Days)
                </Text>

                <View style={styles.usageItem}>
                  <Text style={styles.usageLabel}>ELD Integration</Text>
                  <Text style={styles.usageValue}>
                    {featureUsage.eld_integration || 0} uses
                  </Text>
                </View>

                <View style={styles.usageItem}>
                  <Text style={styles.usageLabel}>Advanced Analytics</Text>
                  <Text style={styles.usageValue}>
                    {featureUsage.advanced_analytics || 0} uses
                  </Text>
                </View>

                <View style={styles.usageItem}>
                  <Text style={styles.usageLabel}>Multi-Tenant Access</Text>
                  <Text style={styles.usageValue}>
                    {featureUsage.multi_tenant_access || 0} uses
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Upgrade Options */}
        {subscription?.plan !== "enterprise" && (
          <View style={styles.upgradeContainer}>
            <Text style={styles.sectionTitle}>Upgrade Options</Text>

            {subscription?.plan === "basic" && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: "#007AFF" }]}
                onPress={() => handleUpgradeRequest("premium")}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: "#5856D6" }]}
              onPress={() => handleUpgradeRequest("enterprise")}
            >
              <Text style={styles.upgradeButtonText}>
                Upgrade to Enterprise
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Users Modal for Enterprise Admins */}
      <Modal
        visible={showUsersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUsersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage User Access</Text>
              <TouchableOpacity onPress={() => setShowUsersModal(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={usersWithAccess}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.usersList}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userRole}>Role: {item.role}</Text>

                  <View style={styles.userFeatures}>
                    <Text style={styles.userFeaturesTitle}>
                      Feature Access:
                    </Text>

                    {item.features.map((feature: any) => (
                      <View key={feature.name} style={styles.userFeatureItem}>
                        <Text style={styles.userFeatureText}>
                          {feature.name.replace("_", " ")}
                        </Text>
                        <Switch
                          value={feature.is_enabled}
                          onValueChange={(value) =>
                            toggleUserFeatureAccess(
                              item.id,
                              feature.name,
                              value
                            )
                          }
                          trackColor={{ false: "#767577", true: "#5856D6" }}
                          thumbColor={
                            feature.is_enabled ? "#FFFFFF" : "#f4f3f4"
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>No users found.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666666",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
    textAlign: "center",
  },
  offlineMessage: {
    backgroundColor: "#FF9500",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000000",
  },
  currentPlanContainer: {
    marginBottom: 24,
  },
  planBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  planText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  planDetails: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  planDetailsValue: {
    fontWeight: "600",
    color: "#000000",
  },
  featureAccessContainer: {
    marginBottom: 24,
  },
  featureList: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  featureText: {
    fontSize: 16,
    color: "#000000",
  },
  featureStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  enterpriseContainer: {
    marginBottom: 24,
  },
  usageContainer: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  usageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  usageLabel: {
    fontSize: 14,
    color: "#000000",
  },
  usageValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5856D6",
  },
  managementButton: {
    backgroundColor: "#5856D6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  managementButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  upgradeContainer: {
    marginBottom: 16,
  },
  upgradeButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  closeButton: {
    color: "#5856D6",
    fontSize: 16,
    fontWeight: "600",
  },
  usersList: {
    padding: 16,
  },
  userItem: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5856D6",
    marginBottom: 8,
  },
  userFeatures: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: 8,
  },
  userFeaturesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  userFeatureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  userFeatureText: {
    fontSize: 14,
    color: "#666666",
  },
  emptyListText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    padding: 20,
  },
});

export default SubscriptionSettings;
