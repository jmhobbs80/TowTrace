'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth, User } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUserProfile, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dutyStatus, setDutyStatus] = useState<'On Duty' | 'Off Duty' | 'On Break'>('On Duty');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    jobTitle: user?.jobTitle || '',
    timeZone: user?.timeZone || 'America/New_York',
    bio: user?.bio || '',
    emailNotifications: user?.preferences?.emailNotifications || false,
    pushNotifications: user?.preferences?.pushNotifications || false,
    smsNotifications: user?.preferences?.smsNotifications || false,
    weeklyReports: user?.preferences?.weeklyReports || false,
    theme: user?.preferences?.theme || 'light',
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        jobTitle: user.jobTitle || '',
        timeZone: user.timeZone || 'America/New_York',
        bio: user.bio || '',
        emailNotifications: user.preferences?.emailNotifications || false,
        pushNotifications: user.preferences?.pushNotifications || false,
        smsNotifications: user.preferences?.smsNotifications || false,
        weeklyReports: user.preferences?.weeklyReports || false,
        theme: user.preferences?.theme || 'light',
      });
      
      // Set initial duty status (if user status exists)
      if (user.status) {
        setDutyStatus(user.status as 'On Duty' | 'Off Duty' | 'On Break');
      }
    }
  }, [user]);
  
  // Handle duty status change
  const handleDutyStatusChange = async (status: 'On Duty' | 'Off Duty' | 'On Break') => {
    try {
      // Update the status in state
      setDutyStatus(status);
      
      // Check if GPS should be enabled or disabled
      const gpsEnabled = status !== 'Off Duty';
      
      // Update the user profile through auth context
      await updateUserProfile({
        status: status,
        gpsEnabled: gpsEnabled
      });
      
      // Show appropriate notification based on status change
      if (status === 'Off Duty') {
        // Notification for turning off GPS
        alert('You are now Off Duty. GPS tracking has been disabled.');
      } else if (status === 'On Duty') {
        // Check if user has active loads
        if (user?.activeLoads && user.activeLoads > 0) {
          alert('You are now On Duty. GPS tracking has been enabled for your active loads.');
        } else {
          alert('You are now On Duty. GPS tracking will activate when you are assigned a load.');
        }
      } else {
        // On Break status
        alert('You are now On Break. Limited GPS tracking remains active.');
      }
      
      // Show brief success message in the UI
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update duty status:', error);
      alert('Failed to update duty status. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Update user profile through auth context
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        jobTitle: formData.jobTitle,
        timeZone: formData.timeZone,
        bio: formData.bio,
        preferences: {
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          smsNotifications: formData.smsNotifications,
          weeklyReports: formData.weeklyReports,
          theme: formData.theme,
        },
      });
      
      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return <div className="p-4">Loading profile information...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {saveSuccess && (
            <div className="mb-4 bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-md text-sm">
              Profile updated successfully!
            </div>
          )}
          
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                form="profile-form"
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This information will be displayed to other users in your organization.
                </p>
              </div>
              
              <div className="mt-6 flex flex-col items-center">
                <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-100">
                  <Image 
                    src={user.avatar || 'https://i.pravatar.cc/150?img=default'} 
                    alt={user.name}
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Change Avatar
                  </button>
                )}
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.jobTitle || 'No job title set'}</p>
                  <div className="mt-1 flex flex-col items-center justify-center space-y-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    
                    {user.role === 'driver' && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Duty Status</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDutyStatusChange('On Duty')}
                            className={`px-3 py-1 text-xs rounded-full ${
                              dutyStatus === 'On Duty'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            On Duty
                          </button>
                          <button
                            onClick={() => handleDutyStatusChange('On Break')}
                            className={`px-3 py-1 text-xs rounded-full ${
                              dutyStatus === 'On Break'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            On Break
                          </button>
                          <button
                            onClick={() => handleDutyStatusChange('Off Duty')}
                            className={`px-3 py-1 text-xs rounded-full ${
                              dutyStatus === 'Off Duty'
                                ? 'bg-gray-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Off Duty
                          </button>
                        </div>
                        
                        {/* GPS Tracking Status */}
                        <div className="mt-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              user.gpsEnabled 
                                ? 'bg-green-500 animate-pulse' 
                                : 'bg-gray-300'
                            }`}></div>
                            <span className="ml-2 text-xs text-gray-600">
                              GPS Tracking: {user.gpsEnabled ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          
                          {user.gpsEnabled && user.activeLoads && user.activeLoads > 0 && (
                            <div className="mt-1 space-y-1">
                              <span className="text-xs text-gray-600">
                                Currently tracking {user.activeLoads} active load{user.activeLoads !== 1 ? 's' : ''}
                              </span>
                              
                              {user.currentPickupLocation && (
                                <div className="flex items-center">
                                  <span className="inline-block w-2 h-2 bg-green-500 mr-1"></span>
                                  <span className="text-xs text-gray-600">
                                    Pickup: {user.currentPickupLocation.locationName} 
                                    ({user.currentPickupLocation.vehicleCount} vehicle{user.currentPickupLocation.vehicleCount !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              )}
                              
                              {user.currentDropoffLocation && (
                                <div className="flex items-center">
                                  <span className="inline-block w-2 h-2 bg-red-500 mr-1"></span>
                                  <span className="text-xs text-gray-600">
                                    Dropoff: {user.currentDropoffLocation.locationName}
                                  </span>
                                </div>
                              )}
                              
                              {/* Navigation Button */}
                              <div className="mt-2">
                                <button
                                  onClick={() => router.push('/dashboard/navigation')}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                  </svg>
                                  Open Navigation
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {dutyStatus !== 'Off Duty' && !user.activeLoads && (
                            <div className="mt-1">
                              <span className="text-xs text-gray-600">
                                GPS will activate when assigned a load
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form id="profile-form">
                <div className="overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 bg-white sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone number</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          autoComplete="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job title</label>
                        <input
                          type="text"
                          name="jobTitle"
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                        <input
                          type="text"
                          name="company"
                          id="company"
                          value={user.company || 'TowTrace Transport'}
                          disabled
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Company name cannot be changed</p>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">Time zone</label>
                        <select
                          id="timeZone"
                          name="timeZone"
                          value={formData.timeZone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing ? 'bg-gray-50' : ''}`}
                        >
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="America/Anchorage">Alaska</option>
                          <option value="Pacific/Honolulu">Hawaii</option>
                        </select>
                      </div>
                      
                      <div className="col-span-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                            placeholder="Brief description about yourself"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Brief description for your profile. URLs are hyperlinked.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
      
      <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Decide how you want to receive notifications from TowTrace.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <fieldset>
                      <legend className="text-base font-medium text-gray-900">By Email</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="emailNotifications"
                              name="emailNotifications"
                              type="checkbox"
                              checked={formData.emailNotifications}
                              onChange={handleCheckboxChange}
                              disabled={!isEditing}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailNotifications" className="font-medium text-gray-700">Important notifications</label>
                            <p className="text-gray-500">Get notified about new activities, jobs, and important alerts.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="weeklyReports"
                              name="weeklyReports"
                              type="checkbox"
                              checked={formData.weeklyReports}
                              onChange={handleCheckboxChange}
                              disabled={!isEditing}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="weeklyReports" className="font-medium text-gray-700">Weekly reports</label>
                            <p className="text-gray-500">Receive a weekly summary of your company's activity.</p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="text-base font-medium text-gray-900">Push Notifications</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="pushNotifications"
                              name="pushNotifications"
                              type="checkbox"
                              checked={formData.pushNotifications}
                              onChange={handleCheckboxChange}
                              disabled={!isEditing}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="pushNotifications" className="font-medium text-gray-700">Push notifications</label>
                            <p className="text-gray-500">Receive push notifications on your mobile device.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="smsNotifications"
                              name="smsNotifications"
                              type="checkbox"
                              checked={formData.smsNotifications}
                              onChange={handleCheckboxChange}
                              disabled={!isEditing}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="smsNotifications" className="font-medium text-gray-700">SMS notifications</label>
                            <p className="text-gray-500">Receive text messages for critical alerts.</p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
      
      <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Activity
          </h3>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Last login</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Unknown'}
                </dd>
              </div>
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Account status</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Account created</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {new Date('2024-01-15').toLocaleDateString()}
                </dd>
              </div>
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Security</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    <span className="mr-2">Two-factor authentication:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Disabled
                    </span>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Enable two-factor authentication
                    </button>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}