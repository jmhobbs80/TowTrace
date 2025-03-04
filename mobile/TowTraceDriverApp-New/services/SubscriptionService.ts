import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

/**
 * Service for managing subscription-related operations
 */
export class SubscriptionService {
  /**
   * Get the current tenant's subscription details
   * @returns Promise resolving to subscription details
   */
  static async getCurrentSubscription(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/overwatch/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      return null;
    }
  }
  
  /**
   * Check if the current tenant has access to a specific feature
   * @param featureName - The feature to check access for
   * @returns Promise resolving to boolean indicating access
   */
  static async hasFeatureAccess(featureName: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/overwatch/feature/${featureName}/access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data.hasAccess === true;
    } catch (error) {
      console.error(`Error checking access to feature ${featureName}:`, error);
      return false;
    }
  }
  
  /**
   * Get available subscription plans and their features
   * @returns Promise resolving to subscription plans data
   */
  static async getSubscriptionPlans(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/overwatch/subscription/plans`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return null;
    }
  }
  
  /**
   * Request a subscription upgrade
   * @param plan - The plan to upgrade to ('basic', 'premium', 'enterprise')
   * @param paymentDetails - Optional payment details
   * @returns Promise resolving to upgrade request result
   */
  static async requestUpgrade(
    plan: 'basic' | 'premium' | 'enterprise',
    paymentDetails?: any
  ): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/overwatch/subscription/upgrade`,
        {
          plan,
          paymentDetails
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error requesting subscription upgrade:', error);
      throw error;
    }
  }
}