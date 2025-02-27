// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import DriversPage from './pages/drivers/DriversPage';
import DriverDetailPage from './pages/drivers/DriverDetailPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryDetailPage from './pages/inventory/InventoryDetailPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotFoundPage from './pages/errors/NotFoundPage';

function App() {
  return (
    <Router>
      <TenantProvider>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Jobs */}
              <Route path="jobs">
                <Route index element={<JobsPage />} />
                <Route path="new" element={<CreateJobPage />} />
                <Route path=":jobId" element={<JobDetailPage />} />
              </Route>
              
              {/* Vehicles */}
              <Route path="vehicles">
                <Route index element={<VehiclesPage />} />
                <Route path=":vehicleId" element={<VehicleDetailPage />} />
              </Route>
              
              {/* Drivers */}
              <Route path="drivers">
                <Route index element={<DriversPage />} />
                <Route path=":driverId" element={<DriverDetailPage />} />
              </Route>
              
              {/* Inventory */}
              <Route path="inventory">
                <Route index element={<InventoryPage />} />
                <Route path=":inventoryId" element={<InventoryDetailPage />} />
              </Route>
              
              {/* User */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              
              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}

export default App;