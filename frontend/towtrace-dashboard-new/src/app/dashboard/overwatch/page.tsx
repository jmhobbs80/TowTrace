'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types based on backend models
type Tenant = {
  id: string;
  name: string;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  payment_status: 'active' | 'past_due' | 'canceled';
  tow_trace_id: string;
  created_at?: string;
  updated_at?: string;
};

type SubscriptionFeature = {
  id: string;
  tenant_id: string;
  feature_name: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

type User = {
  id: string;
  email: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'manager' | 'system_admin' | 'client_admin';
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
};

// Mock tenants data
const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'ABC Towing',
    subscription_plan: 'premium',
    billing_cycle: 'monthly',
    payment_status: 'active',
    tow_trace_id: 'TowTraceID#1001',
    created_at: '2025-01-15T12:00:00Z',
    updated_at: '2025-02-28T15:30:00Z'
  },
  {
    id: '2',
    name: 'Smith & Sons Towing',
    subscription_plan: 'basic',
    billing_cycle: 'yearly',
    payment_status: 'active',
    tow_trace_id: 'TowTraceID#1002',
    created_at: '2025-02-01T09:15:00Z',
    updated_at: '2025-02-01T09:15:00Z'
  },
  {
    id: '3',
    name: 'City Recovery Services',
    subscription_plan: 'enterprise',
    billing_cycle: 'yearly',
    payment_status: 'past_due',
    tow_trace_id: 'TowTraceID#1003',
    created_at: '2024-11-20T14:45:00Z',
    updated_at: '2025-02-15T10:20:00Z'
  }
];

// Mock users data
const mockUsers: Record<string, User[]> = {
  '1': [
    {
      id: '101',
      email: 'john@abctowing.com',
      role: 'client_admin',
      tenant_id: '1',
      created_at: '2025-01-15T12:05:00Z'
    },
    {
      id: '102',
      email: 'mark@abctowing.com',
      role: 'dispatcher',
      tenant_id: '1',
      created_at: '2025-01-16T09:30:00Z'
    },
    {
      id: '103',
      email: 'sarah@abctowing.com',
      role: 'driver',
      tenant_id: '1',
      created_at: '2025-01-17T11:20:00Z'
    }
  ],
  '2': [
    {
      id: '201',
      email: 'david@smithtowing.com',
      role: 'client_admin',
      tenant_id: '2',
      created_at: '2025-02-01T09:20:00Z'
    },
    {
      id: '202',
      email: 'lisa@smithtowing.com',
      role: 'dispatcher',
      tenant_id: '2',
      created_at: '2025-02-02T10:15:00Z'
    }
  ],
  '3': [
    {
      id: '301',
      email: 'mike@cityrecovery.com',
      role: 'client_admin',
      tenant_id: '3',
      created_at: '2024-11-20T14:50:00Z'
    },
    {
      id: '302',
      email: 'jennifer@cityrecovery.com',
      role: 'manager',
      tenant_id: '3',
      created_at: '2024-11-21T08:45:00Z'
    },
    {
      id: '303',
      email: 'kevin@cityrecovery.com',
      role: 'driver',
      tenant_id: '3',
      created_at: '2024-11-22T13:10:00Z'
    },
    {
      id: '304',
      email: 'amy@cityrecovery.com',
      role: 'driver',
      tenant_id: '3',
      created_at: '2024-11-23T16:30:00Z'
    }
  ]
};

// Mock features data
const mockFeatures: Record<string, SubscriptionFeature[]> = {
  '1': [
    { id: '1001', tenant_id: '1', feature_name: 'vin_scanning', is_enabled: true },
    { id: '1002', tenant_id: '1', feature_name: 'gps_tracking', is_enabled: true },
    { id: '1003', tenant_id: '1', feature_name: 'job_management', is_enabled: true },
    { id: '1004', tenant_id: '1', feature_name: 'fleet_management', is_enabled: true },
    { id: '1005', tenant_id: '1', feature_name: 'inspection_reports', is_enabled: true },
    { id: '1006', tenant_id: '1', feature_name: 'quickbooks_integration', is_enabled: true },
    { id: '1007', tenant_id: '1', feature_name: 'storage_tracking', is_enabled: true },
    { id: '1008', tenant_id: '1', feature_name: 'eld_integration', is_enabled: false },
    { id: '1009', tenant_id: '1', feature_name: 'advanced_analytics', is_enabled: true }
  ],
  '2': [
    { id: '2001', tenant_id: '2', feature_name: 'vin_scanning', is_enabled: true },
    { id: '2002', tenant_id: '2', feature_name: 'gps_tracking', is_enabled: true },
    { id: '2003', tenant_id: '2', feature_name: 'job_management', is_enabled: true },
    { id: '2004', tenant_id: '2', feature_name: 'fleet_management', is_enabled: true },
    { id: '2005', tenant_id: '2', feature_name: 'inspection_reports', is_enabled: true }
  ],
  '3': [
    { id: '3001', tenant_id: '3', feature_name: 'vin_scanning', is_enabled: true },
    { id: '3002', tenant_id: '3', feature_name: 'gps_tracking', is_enabled: true },
    { id: '3003', tenant_id: '3', feature_name: 'job_management', is_enabled: true },
    { id: '3004', tenant_id: '3', feature_name: 'fleet_management', is_enabled: true },
    { id: '3005', tenant_id: '3', feature_name: 'inspection_reports', is_enabled: true },
    { id: '3006', tenant_id: '3', feature_name: 'quickbooks_integration', is_enabled: true },
    { id: '3007', tenant_id: '3', feature_name: 'storage_tracking', is_enabled: true },
    { id: '3008', tenant_id: '3', feature_name: 'eld_integration', is_enabled: true },
    { id: '3009', tenant_id: '3', feature_name: 'advanced_analytics', is_enabled: true },
    { id: '3010', tenant_id: '3', feature_name: 'multi_tenant_access', is_enabled: true },
    { id: '3011', tenant_id: '3', feature_name: 'ai_insights', is_enabled: true },
    { id: '3012', tenant_id: '3', feature_name: 'advanced_routing', is_enabled: true },
    { id: '3013', tenant_id: '3', feature_name: 'customer_portal', is_enabled: true },
    { id: '3014', tenant_id: '3', feature_name: 'law_enforcement_tools', is_enabled: true }
  ]
};

export default function OverwatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [tenantFeatures, setTenantFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState({
    tenants: true,
    users: false,
    features: false
  });
  const [error, setError] = useState({
    tenants: null,
    users: null,
    features: null
  });
  
  // Form states for creating new tenant
  const [showNewTenantForm, setShowNewTenantForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    subscription_plan: 'basic' as 'basic' | 'premium' | 'enterprise',
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    payment_status: 'active' as 'active' | 'past_due' | 'canceled',
    admin_email: ''
  });
  
  // Form states for editing tenant
  const [showEditTenantForm, setShowEditTenantForm] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  
  // Available features for subscription plans
  const AVAILABLE_FEATURES = [
    'vin_scanning',
    'gps_tracking',
    'job_management',
    'fleet_management',
    'inspection_reports',
    'quickbooks_integration',
    'storage_tracking',
    'eld_integration',
    'advanced_analytics',
    'multi_tenant_access',
    'ai_insights',
    'advanced_routing',
    'customer_portal',
    'law_enforcement_tools'
  ];
  
  // Check if user is a system admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      // Redirect non-system admins
      router.push('/dashboard');
    } else {
      // Fetch tenants on initial load (simulated)
      fetchTenants();
    }
  }, [user, router]);
  
  // Fetch all tenants (simulated)
  const fetchTenants = async () => {
    setLoading(prev => ({ ...prev, tenants: true }));
    try {
      // Simulate API call
      setTimeout(() => {
        setTenants(mockTenants);
        setLoading(prev => ({ ...prev, tenants: false }));
      }, 800);
    } catch (err: any) {
      setError(prev => ({ ...prev, tenants: err.message }));
      setLoading(prev => ({ ...prev, tenants: false }));
    }
  };
  
  // Fetch users for a specific tenant (simulated)
  const fetchTenantUsers = async (tenantId: string) => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      // Simulate API call
      setTimeout(() => {
        setTenantUsers(mockUsers[tenantId] || []);
        setLoading(prev => ({ ...prev, users: false }));
      }, 600);
    } catch (err: any) {
      setError(prev => ({ ...prev, users: err.message }));
      setLoading(prev => ({ ...prev, users: false }));
    }
  };
  
  // Fetch features for a specific tenant (simulated)
  const fetchTenantFeatures = async (tenantId: string) => {
    setLoading(prev => ({ ...prev, features: true }));
    try {
      // Simulate API call
      setTimeout(() => {
        setTenantFeatures(mockFeatures[tenantId] || []);
        setLoading(prev => ({ ...prev, features: false }));
      }, 700);
    } catch (err: any) {
      setError(prev => ({ ...prev, features: err.message }));
      setLoading(prev => ({ ...prev, features: false }));
    }
  };
  
  // Handle tenant selection
  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenant(tenantId);
    fetchTenantUsers(tenantId);
    fetchTenantFeatures(tenantId);
  };
  
  // Create new tenant (simulated)
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      setTimeout(() => {
        // Create a new tenant object
        const newTenantObject: Tenant = {
          id: `${mockTenants.length + 1}`,
          name: newTenant.name,
          subscription_plan: newTenant.subscription_plan,
          billing_cycle: newTenant.billing_cycle,
          payment_status: newTenant.payment_status,
          tow_trace_id: `TowTraceID#${1000 + mockTenants.length + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to tenants array
        setTenants([...tenants, newTenantObject]);
        
        // Create default features based on subscription plan
        let features: SubscriptionFeature[] = [];
        if (newTenant.subscription_plan === 'basic') {
          features = AVAILABLE_FEATURES.slice(0, 5).map((feature, index) => ({
            id: `new${index + 1}`,
            tenant_id: newTenantObject.id,
            feature_name: feature,
            is_enabled: true
          }));
        } else if (newTenant.subscription_plan === 'premium') {
          features = AVAILABLE_FEATURES.slice(0, 9).map((feature, index) => ({
            id: `new${index + 1}`,
            tenant_id: newTenantObject.id,
            feature_name: feature,
            is_enabled: true
          }));
        } else {
          features = AVAILABLE_FEATURES.map((feature, index) => ({
            id: `new${index + 1}`,
            tenant_id: newTenantObject.id,
            feature_name: feature,
            is_enabled: true
          }));
        }
        
        // Create admin user
        const adminUser: User = {
          id: `new${Date.now()}`,
          email: newTenant.admin_email,
          role: 'client_admin',
          tenant_id: newTenantObject.id,
          created_at: new Date().toISOString()
        };
        
        // Update mock data
        mockUsers[newTenantObject.id] = [adminUser];
        mockFeatures[newTenantObject.id] = features;
        
        // Reset form
        setNewTenant({
          name: '',
          subscription_plan: 'basic',
          billing_cycle: 'monthly',
          payment_status: 'active',
          admin_email: ''
        });
        setShowNewTenantForm(false);
      }, 800);
    } catch (err: any) {
      alert(`Error creating tenant: ${err.message}`);
    }
  };
  
  // Update tenant (simulated)
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenant) return;
    
    try {
      // Simulate API call
      setTimeout(() => {
        // Update tenant in list
        const updatedTenants = tenants.map(t => 
          t.id === editTenant.id ? { ...editTenant, updated_at: new Date().toISOString() } : t
        );
        setTenants(updatedTenants);
        
        // Update features if subscription plan changed
        const oldTenant = tenants.find(t => t.id === editTenant.id);
        if (oldTenant && oldTenant.subscription_plan !== editTenant.subscription_plan) {
          let features: SubscriptionFeature[] = [];
          
          if (editTenant.subscription_plan === 'basic') {
            features = AVAILABLE_FEATURES.slice(0, 5).map((feature, index) => ({
              id: `${editTenant.id}${index + 1}`,
              tenant_id: editTenant.id,
              feature_name: feature,
              is_enabled: true
            }));
          } else if (editTenant.subscription_plan === 'premium') {
            features = AVAILABLE_FEATURES.slice(0, 9).map((feature, index) => ({
              id: `${editTenant.id}${index + 1}`,
              tenant_id: editTenant.id,
              feature_name: feature,
              is_enabled: true
            }));
          } else {
            features = AVAILABLE_FEATURES.map((feature, index) => ({
              id: `${editTenant.id}${index + 1}`,
              tenant_id: editTenant.id,
              feature_name: feature,
              is_enabled: true
            }));
          }
          
          mockFeatures[editTenant.id] = features;
          
          // If this was the selected tenant, refresh its details
          if (selectedTenant === editTenant.id) {
            setTenantFeatures(features);
          }
        }
        
        // Close form
        setShowEditTenantForm(false);
        setEditTenant(null);
      }, 800);
    } catch (err: any) {
      alert(`Error updating tenant: ${err.message}`);
    }
  };
  
  // Toggle feature for tenant (simulated)
  const toggleFeature = async (featureId: string, isEnabled: boolean) => {
    try {
      // Update feature in state
      const updatedFeatures = tenantFeatures.map(f => 
        f.id === featureId ? { ...f, is_enabled: !isEnabled } : f
      );
      setTenantFeatures(updatedFeatures);
      
      // Update mock data
      if (selectedTenant) {
        mockFeatures[selectedTenant] = updatedFeatures;
      }
    } catch (err: any) {
      alert(`Error toggling feature: ${err.message}`);
    }
  };
  
  // Create new user for tenant (simulated)
  const handleAddUser = async (email: string, role: string) => {
    if (!selectedTenant) return;
    
    try {
      // Create new user
      const newUser: User = {
        id: `new${Date.now()}`,
        email,
        role: role as any,
        tenant_id: selectedTenant,
        created_at: new Date().toISOString()
      };
      
      // Add to users array
      const updatedUsers = [...tenantUsers, newUser];
      setTenantUsers(updatedUsers);
      
      // Update mock data
      mockUsers[selectedTenant] = updatedUsers;
    } catch (err: any) {
      alert(`Error creating user: ${err.message}`);
    }
  };
  
  // Format date string for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get subscription plan label with color
  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Basic</span>;
      case 'premium':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Premium</span>;
      case 'enterprise':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Enterprise</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{plan}</span>;
    }
  };
  
  // Get payment status label with color
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'past_due':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Past Due</span>;
      case 'canceled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Canceled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Overwatch Admin Panel</h2>
        <button
          onClick={() => setShowNewTenantForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Create New Tenant
        </button>
      </div>
      
      {/* Create Tenant Modal */}
      {showNewTenantForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateTenant}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Tenant</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        id="name"
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">Admin Email</label>
                      <input
                        type="email"
                        id="admin_email"
                        value={newTenant.admin_email}
                        onChange={(e) => setNewTenant({...newTenant, admin_email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                      <select
                        id="subscription_plan"
                        value={newTenant.subscription_plan}
                        onChange={(e) => setNewTenant({...newTenant, subscription_plan: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                      <select
                        id="billing_cycle"
                        value={newTenant.billing_cycle}
                        onChange={(e) => setNewTenant({...newTenant, billing_cycle: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <select
                        id="payment_status"
                        value={newTenant.payment_status}
                        onChange={(e) => setNewTenant({...newTenant, payment_status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="past_due">Past Due</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTenantForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Tenant Modal */}
      {showEditTenantForm && editTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateTenant}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Tenant: {editTenant.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        id="edit-name"
                        value={editTenant.name}
                        onChange={(e) => setEditTenant({...editTenant, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-subscription_plan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                      <select
                        id="edit-subscription_plan"
                        value={editTenant.subscription_plan}
                        onChange={(e) => setEditTenant({...editTenant, subscription_plan: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-billing_cycle" className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                      <select
                        id="edit-billing_cycle"
                        value={editTenant.billing_cycle}
                        onChange={(e) => setEditTenant({...editTenant, billing_cycle: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-payment_status" className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <select
                        id="edit-payment_status"
                        value={editTenant.payment_status}
                        onChange={(e) => setEditTenant({...editTenant, payment_status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="past_due">Past Due</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditTenantForm(false);
                      setEditTenant(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenants List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-700">Tenants</h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {loading.tenants ? (
              <div className="p-4 text-center">
                <svg className="animate-spin h-6 w-6 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error.tenants ? (
              <div className="p-4 text-center text-red-500">
                Error: {error.tenants}
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tenants found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <li 
                    key={tenant.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedTenant === tenant.id ? 'bg-primary-50' : ''}`}
                    onClick={() => handleTenantSelect(tenant.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.tow_trace_id}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="mb-1">{getPlanLabel(tenant.subscription_plan)}</div>
                        <div>{getStatusLabel(tenant.payment_status)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Tenant Details */}
        <div className="lg:col-span-2">
          {selectedTenant ? (
            <div className="space-y-6">
              {/* Tenant Info Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">Tenant Information</h3>
                  <button
                    onClick={() => {
                      const tenant = tenants.find(t => t.id === selectedTenant);
                      if (tenant) {
                        setEditTenant(tenant);
                        setShowEditTenantForm(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Edit Tenant
                  </button>
                </div>
                <div className="p-4">
                  {tenants.filter(t => t.id === selectedTenant).map((tenant) => (
                    <div key={tenant.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Company Name</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{tenant.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">TowTrace ID</p>
                          <p className="mt-1 text-base font-medium text-gray-900">{tenant.tow_trace_id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Subscription Plan</p>
                          <p className="mt-1">{getPlanLabel(tenant.subscription_plan)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Billing Cycle</p>
                          <p className="mt-1 text-base text-gray-900 capitalize">{tenant.billing_cycle}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Payment Status</p>
                          <p className="mt-1">{getStatusLabel(tenant.payment_status)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Created At</p>
                          <p className="mt-1 text-base text-gray-900">{formatDate(tenant.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tenant Users */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">Users</h3>
                  <button
                    onClick={() => {
                      const email = prompt('Enter user email:');
                      const role = prompt('Enter user role (admin, dispatcher, driver, manager, client_admin):');
                      if (email && role) {
                        handleAddUser(email, role);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {loading.users ? (
                    <div className="p-4 text-center">
                      <svg className="animate-spin h-6 w-6 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : error.users ? (
                    <div className="p-4 text-center text-red-500">
                      Error: {error.users}
                    </div>
                  ) : tenantUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No users found for this tenant
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tenantUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-primary-600 hover:text-primary-900 mr-3"
                                onClick={() => {
                                  const role = prompt('Enter new role (admin, dispatcher, driver, manager, client_admin):', user.role);
                                  if (role) {
                                    // Update user role (simulated)
                                    const updatedUsers = tenantUsers.map(u => 
                                      u.id === user.id ? { ...u, role: role as any } : u
                                    );
                                    setTenantUsers(updatedUsers);
                                    if (selectedTenant) {
                                      mockUsers[selectedTenant] = updatedUsers;
                                    }
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this user?')) {
                                    // Delete user (simulated)
                                    const updatedUsers = tenantUsers.filter(u => u.id !== user.id);
                                    setTenantUsers(updatedUsers);
                                    if (selectedTenant) {
                                      mockUsers[selectedTenant] = updatedUsers;
                                    }
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              
              {/* Subscription Features */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-700">Subscription Features</h3>
                </div>
                <div className="p-4">
                  {loading.features ? (
                    <div className="text-center">
                      <svg className="animate-spin h-6 w-6 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : error.features ? (
                    <div className="text-center text-red-500">
                      Error: {error.features}
                    </div>
                  ) : tenantFeatures.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No features found for this tenant
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tenantFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {feature.feature_name.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={feature.is_enabled}
                                onChange={() => toggleFeature(feature.id, feature.is_enabled)}
                              />
                              <div className={`block w-10 h-6 rounded-full ${feature.is_enabled ? 'bg-primary-600' : 'bg-gray-400'}`}></div>
                              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${feature.is_enabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Tenant</h3>
              <p className="text-gray-500">Choose a tenant from the list to view and manage its details</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .dot {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}