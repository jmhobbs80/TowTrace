/**
 * API client for TowTrace backend
 * Handles all communication with the TowTrace API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from './auth';

// API base URL
const API_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

// Create an Axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add request interceptor to inject auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Create consistent error format
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected error occurred',
      data: error.response?.data || {},
    };

    // Handle specific error codes
    if (errorResponse.status === 401) {
      // Unauthorized - token invalid or expired
      console.log('Authentication error, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorResponse);
    }
    
    return Promise.reject(errorResponse);
  }
);

// Mock data for development
const mockData = {
  jobs: [
    {
      id: '1001',
      status: 'active',
      from: 'Los Angeles, CA',
      to: 'Phoenix, AZ',
      driverName: 'Michael Thompson',
      driverId: 'driver-1',
      vehicleCount: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      vehicles: [
        { id: 'v1', vin: '1HGCM82633A123456', make: 'Honda', model: 'Accord', year: 2019 },
        { id: 'v2', vin: 'JH4KA7660PC123456', make: 'Acura', model: 'Legend', year: 2018 }
      ]
    },
    {
      id: '1002',
      status: 'pending',
      from: 'San Francisco, CA',
      to: 'Portland, OR',
      driverName: 'Sarah Johnson',
      driverId: 'driver-2',
      vehicleCount: 1,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      vehicles: [
        { id: 'v3', vin: '1N4AL3AP8DN123456', make: 'Nissan', model: 'Altima', year: 2020 }
      ]
    },
    {
      id: '1003',
      status: 'completed',
      from: 'Denver, CO',
      to: 'Salt Lake City, UT',
      driverName: 'David Wilson',
      driverId: 'driver-3',
      vehicleCount: 3,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      vehicles: [
        { id: 'v4', vin: '1G1JC5SH4D4123456', make: 'Chevrolet', model: 'Sonic', year: 2017 },
        { id: 'v5', vin: '1ZVBP8AM4C5123456', make: 'Ford', model: 'Mustang', year: 2021 },
        { id: 'v6', vin: '2FMDK3JC4AB123456', make: 'Ford', model: 'Edge', year: 2016 }
      ]
    }
  ],
  drivers: [
    { id: 'driver-1', name: 'Michael Thompson', email: 'michael@example.com', phone: '555-123-4567', status: 'active', avatar: 'https://i.pravatar.cc/150?u=michael@example.com' },
    { id: 'driver-2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-987-6543', status: 'active', avatar: 'https://i.pravatar.cc/150?u=sarah@example.com' },
    { id: 'driver-3', name: 'David Wilson', email: 'david@example.com', phone: '555-456-7890', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=david@example.com' },
    { id: 'driver-4', name: 'James Miller', email: 'james@example.com', phone: '555-222-3333', status: 'active', avatar: 'https://i.pravatar.cc/150?u=james@example.com' },
    { id: 'driver-5', name: 'Robert Brown', email: 'robert@example.com', phone: '555-444-5555', status: 'active', avatar: 'https://i.pravatar.cc/150?u=robert@example.com' }
  ],
  vehicles: [
    { id: 'v1', vin: '1HGCM82633A123456', make: 'Honda', model: 'Accord', year: 2019, status: 'active' },
    { id: 'v2', vin: 'JH4KA7660PC123456', make: 'Acura', model: 'Legend', year: 2018, status: 'active' },
    { id: 'v3', vin: '1N4AL3AP8DN123456', make: 'Nissan', model: 'Altima', year: 2020, status: 'pending' },
    { id: 'v4', vin: '1G1JC5SH4D4123456', make: 'Chevrolet', model: 'Sonic', year: 2017, status: 'completed' },
    { id: 'v5', vin: '1ZVBP8AM4C5123456', make: 'Ford', model: 'Mustang', year: 2021, status: 'active' },
    { id: 'v6', vin: '2FMDK3JC4AB123456', make: 'Ford', model: 'Edge', year: 2016, status: 'inactive' }
  ],
  inspections: [
    { id: 'i1', vehicleId: 'v1', driverId: 'driver-1', status: 'passed', date: new Date(Date.now() - 604800000).toISOString(), notes: 'All systems normal' },
    { id: 'i2', vehicleId: 'v2', driverId: 'driver-1', status: 'passed', date: new Date(Date.now() - 1209600000).toISOString(), notes: 'Minor scratch on passenger door' },
    { id: 'i3', vehicleId: 'v3', driverId: 'driver-2', status: 'failed', date: new Date(Date.now() - 172800000).toISOString(), notes: 'Check engine light on, needs service' }
  ]
};

/**
 * API wrapper functions
 * These handle both mock data and real API calls
 */

// Jobs API
export const JobsAPI = {
  // Get all jobs
  async getJobs(params?: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockData.jobs });
        }, 500);
      });
    }
    return apiClient.get('/jobs', { params });
  },
  
  // Get a specific job
  async getJob(jobId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const job = mockData.jobs.find(job => job.id === jobId);
          if (job) {
            resolve({ data: job });
          } else {
            reject({ status: 404, message: 'Job not found' });
          }
        }, 500);
      });
    }
    return apiClient.get(`/jobs/${jobId}`);
  },
  
  // Create a new job
  async createJob(jobData: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newJob = {
            id: `job-${Date.now()}`,
            ...jobData,
            createdAt: new Date().toISOString()
          };
          mockData.jobs.push(newJob);
          resolve({ data: newJob });
        }, 500);
      });
    }
    return apiClient.post('/jobs', jobData);
  },
  
  // Update a job
  async updateJob(jobId: string, jobData: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const jobIndex = mockData.jobs.findIndex(job => job.id === jobId);
          if (jobIndex >= 0) {
            mockData.jobs[jobIndex] = { ...mockData.jobs[jobIndex], ...jobData };
            resolve({ data: mockData.jobs[jobIndex] });
          } else {
            reject({ status: 404, message: 'Job not found' });
          }
        }, 500);
      });
    }
    return apiClient.put(`/jobs/${jobId}`, jobData);
  },
  
  // Delete a job
  async deleteJob(jobId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const jobIndex = mockData.jobs.findIndex(job => job.id === jobId);
          if (jobIndex >= 0) {
            mockData.jobs.splice(jobIndex, 1);
            resolve({ data: { success: true } });
          } else {
            reject({ status: 404, message: 'Job not found' });
          }
        }, 500);
      });
    }
    return apiClient.delete(`/jobs/${jobId}`);
  },
  
  // Assign a driver to a job
  async assignDriver(jobId: string, driverId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const jobIndex = mockData.jobs.findIndex(job => job.id === jobId);
          const driver = mockData.drivers.find(driver => driver.id === driverId);
          
          if (jobIndex >= 0 && driver) {
            mockData.jobs[jobIndex].driverId = driverId;
            mockData.jobs[jobIndex].driverName = driver.name;
            resolve({ data: mockData.jobs[jobIndex] });
          } else {
            reject({ status: 404, message: 'Job or driver not found' });
          }
        }, 500);
      });
    }
    return apiClient.post(`/jobs/${jobId}/assign`, { driverId });
  }
};

// Drivers API
export const DriversAPI = {
  // Get all drivers
  async getDrivers(params?: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockData.drivers });
        }, 500);
      });
    }
    return apiClient.get('/drivers', { params });
  },
  
  // Get a specific driver
  async getDriver(driverId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const driver = mockData.drivers.find(driver => driver.id === driverId);
          if (driver) {
            resolve({ data: driver });
          } else {
            reject({ status: 404, message: 'Driver not found' });
          }
        }, 500);
      });
    }
    return apiClient.get(`/drivers/${driverId}`);
  },
  
  // Get driver's current jobs
  async getDriverJobs(driverId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const jobs = mockData.jobs.filter(job => job.driverId === driverId);
          resolve({ data: jobs });
        }, 500);
      });
    }
    return apiClient.get(`/drivers/${driverId}/jobs`);
  }
};

// Vehicles API
export const VehiclesAPI = {
  // Get all vehicles
  async getVehicles(params?: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockData.vehicles });
        }, 500);
      });
    }
    return apiClient.get('/vehicles', { params });
  },
  
  // Get a specific vehicle
  async getVehicle(vehicleId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const vehicle = mockData.vehicles.find(vehicle => vehicle.id === vehicleId);
          if (vehicle) {
            resolve({ data: vehicle });
          } else {
            reject({ status: 404, message: 'Vehicle not found' });
          }
        }, 500);
      });
    }
    return apiClient.get(`/vehicles/${vehicleId}`);
  },
  
  // Add a new vehicle
  async addVehicle(vehicleData: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newVehicle = {
            id: `v${mockData.vehicles.length + 1}`,
            ...vehicleData,
            status: 'active'
          };
          mockData.vehicles.push(newVehicle);
          resolve({ data: newVehicle });
        }, 500);
      });
    }
    return apiClient.post('/vehicles', vehicleData);
  },
  
  // Lookup VIN information
  async lookupVIN(vin: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock VIN lookup data
          resolve({
            data: {
              vin,
              make: 'Honda',
              model: 'Accord',
              year: 2020,
              trim: 'LX',
              engine: '2.0L I4',
              transmission: 'Automatic',
              drivetrain: 'FWD',
              fuelType: 'Gasoline',
              exteriorColor: 'Silver',
              interiorColor: 'Black'
            }
          });
        }, 1000);
      });
    }
    return apiClient.get(`/vehicles/lookup/${vin}`);
  }
};

// Inspections API
export const InspectionsAPI = {
  // Get all inspections
  async getInspections(params?: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockData.inspections });
        }, 500);
      });
    }
    return apiClient.get('/inspections', { params });
  },
  
  // Get a specific inspection
  async getInspection(inspectionId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const inspection = mockData.inspections.find(inspection => inspection.id === inspectionId);
          if (inspection) {
            resolve({ data: inspection });
          } else {
            reject({ status: 404, message: 'Inspection not found' });
          }
        }, 500);
      });
    }
    return apiClient.get(`/inspections/${inspectionId}`);
  },
  
  // Create a new inspection
  async createInspection(inspectionData: any) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newInspection = {
            id: `i${mockData.inspections.length + 1}`,
            ...inspectionData,
            date: new Date().toISOString()
          };
          mockData.inspections.push(newInspection);
          resolve({ data: newInspection });
        }, 500);
      });
    }
    return apiClient.post('/inspections', inspectionData);
  }
};

// QuickBooks API
export const QuickBooksAPI = {
  // Get QuickBooks connection status
  async getConnectionStatus() {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            data: { 
              connected: true,
              companyName: 'TowTrace LLC',
              lastSync: new Date(Date.now() - 86400000).toISOString()
            } 
          });
        }, 500);
      });
    }
    return apiClient.get('/quickbooks/status');
  },
  
  // Sync with QuickBooks
  async syncWithQuickBooks() {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            data: { 
              success: true,
              syncedAt: new Date().toISOString(),
              syncedItems: {
                invoices: 24,
                customers: 18,
                items: 35
              }
            } 
          });
        }, 1500);
      });
    }
    return apiClient.post('/quickbooks/sync');
  },
  
  // Generate invoice for job
  async generateInvoice(jobId: string) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            data: { 
              success: true,
              invoiceId: `INV-${Date.now()}`,
              jobId,
              amount: 450.00,
              createdAt: new Date().toISOString()
            } 
          });
        }, 1000);
      });
    }
    return apiClient.post(`/quickbooks/invoice/${jobId}`);
  }
};

// Default export for the API client
export default apiClient;