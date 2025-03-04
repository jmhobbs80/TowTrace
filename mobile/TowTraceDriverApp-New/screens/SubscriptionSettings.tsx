import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import { SubscriptionService } from '../services/SubscriptionService';
import NetInfo from '@react-native-community/netinfo';
import useAuth from '../hooks/useAuth';

const SubscriptionSettings: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  
  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
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
      const subscriptionData = await SubscriptionService.getCurrentSubscription();
      setSubscription(subscriptionData);
      
      // Get available plans
      const plansData = await SubscriptionService.getSubscriptionPlans();
      setAvailablePlans(plansData?.plans || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpgradeRequest = async (plan: string) => {
    if (!isConnected) {
      Alert.alert('Error', 'Internet connection is required to upgrade your subscription.');
      return;
    }
    
    Alert.alert(
      'Request Subscription Upgrade',
      `Would you like to request an upgrade to the ${plan.toUpperCase()} plan? Your administrator will need to approve this request.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Request Upgrade',
          onPress: async () => {
            try {
              setIsLoading(true);
              await SubscriptionService.requestUpgrade(plan as any);
              Alert.alert('Success', 'Your subscription upgrade request has been sent to your administrator.');
              loadSubscriptionData();
            } catch (error) {
              console.error('Error requesting upgrade:', error);
              Alert.alert('Error', 'Failed to request subscription upgrade. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleContactAdmin = () => {
    // This would typically email or message the admin
    // For now, we'll just show an alert
    Alert.alert(
      'Contact Administrator',
      'Please contact your system administrator for subscription changes.',
      [
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getPlanColor = (plan: string): string => {
    switch (plan) {
      case 'basic':
        return '#8E8E93'; // Gray
      case 'premium':
        return '#007AFF'; // Blue
      case 'enterprise':
        return '#5856D6'; // Purple
      default:
        return '#8E8E93'; // Gray
    }
  };
  
  const getFeatureIcon = (isIncluded: boolean): string => {
    return isIncluded ? '✓' : '✕';
  };
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription information...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Subscription Settings</Text>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Some features may have limited functionality.
            </Text>
          </View>
        )}
        
        <View style={styles.currentPlanContainer}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          
          <View style={[
            styles.planBadge, 
            { backgroundColor: getPlanColor(subscription?.plan || 'basic') }
          ]}>
            <Text style={styles.planText}>
              {(subscription?.plan || 'basic').toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.planDetails}>
            Status: <Text style={styles.planDetailsValue}>{subscription?.status || 'Active'}</Text>
          </Text>
          
          <Text style={styles.planDetails}>
            Renews: <Text style={styles.planDetailsValue}>{formatDate(subscription?.renewal_date)}</Text>
          </Text>
          
          <Text style={styles.planDetails}>
            Billing Cycle: <Text style={styles.planDetailsValue}>{subscription?.billing_cycle || 'Monthly'}</Text>
          </Text>
        </View>
        
        <View style={styles.featureAccessContainer}>
          <Text style={styles.sectionTitle}>Feature Access</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>VIN Scanning</Text>
              <Text style={[
                styles.featureStatus, 
                { color: '#34C759' }
              ]}>
                {getFeatureIcon(true)}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>GPS Tracking</Text>
              <Text style={[
                styles.featureStatus, 
                { color: '#34C759' }
              ]}>
                {getFeatureIcon(true)}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Job Management</Text>
              <Text style={[
                styles.featureStatus, 
                { color: '#34C759' }
              ]}>
                {getFeatureIcon(true)}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Inspection Reports</Text>
              <Text style={[
                styles.featureStatus, 
                { color: '#34C759' }
              ]}>
                {getFeatureIcon(true)}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>ELD Integration</Text>
              <Text style={[
                styles.featureStatus, 
                { color: subscription?.plan === 'basic' ? '#FF3B30' : '#34C759' }
              ]}>
                {getFeatureIcon(subscription?.plan !== 'basic')}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Advanced Analytics</Text>
              <Text style={[
                styles.featureStatus, 
                { color: subscription?.plan === 'basic' ? '#FF3B30' : '#34C759' }
              ]}>
                {getFeatureIcon(subscription?.plan !== 'basic')}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>Multi-Tenant Access</Text>
              <Text style={[
                styles.featureStatus, 
                { color: subscription?.plan === 'enterprise' ? '#34C759' : '#FF3B30' }
              ]}>
                {getFeatureIcon(subscription?.plan === 'enterprise')}
              </Text>
            </View>
          </View>
        </View>
        
        {subscription?.plan !== 'enterprise' && (
          <View style={styles.upgradeContainer}>
            <Text style={styles.sectionTitle}>Upgrade Options</Text>
            
            {subscription?.plan === 'basic' && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: '#007AFF' }]}
                onPress={() => handleUpgradeRequest('premium')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: '#5856D6' }]}
              onPress={() => handleUpgradeRequest('enterprise')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Enterprise</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactAdmin}
            >
              <Text style={styles.contactButtonText}>Contact Administrator</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  offlineMessage: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  currentPlanContainer: {
    marginBottom: 24,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  planText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planDetails: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  planDetailsValue: {
    fontWeight: '600',
    color: '#000000',
  },
  featureAccessContainer: {
    marginBottom: 24,
  },
  featureList: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  featureText: {
    fontSize: 16,
    color: '#000000',
  },
  featureStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeContainer: {
    marginBottom: 16,
  },
  upgradeButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
  },
  contactButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SubscriptionSettings;