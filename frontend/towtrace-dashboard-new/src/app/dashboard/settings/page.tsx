'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weeklyReport: true,
    newJob: true,
    inspection: true,
    documentExpiration: true,
    driverArrival: true,
  });
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'TowTrace Towing Services',
    email: 'info@towtrace-example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, Anytown, CA 12345',
    website: 'www.towtrace-example.com',
  });
  
  const [accountSettings, setAccountSettings] = useState({
    units: 'miles',
    timeFormat: '12h',
    language: 'en',
    theme: 'light',
  });
  
  const tabs = [
    { id: 'account', name: 'Account' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'billing', name: 'Billing & Subscription' },
    { id: 'security', name: 'Security' },
    { id: 'users', name: 'Users' },
    { id: 'quickbooks', name: 'QuickBooks' },
    { id: 'general', name: 'General' },
    { id: 'feedback', name: 'Feedback & Support' },
  ];
  
  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your company details that will be displayed across the platform.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                  Company name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company-name"
                    id="company-name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="company-email"
                    id="company-email"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company-phone"
                    id="company-phone"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="company-address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company-address"
                    id="company-address"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company-website"
                    id="company-website"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Branding</h3>
            <p className="mt-1 text-sm text-gray-500">
              Customize your company logo and branding colors.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">TT</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Change
                  </button>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    name="primary-color"
                    id="primary-color"
                    className="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value="#0f766e"
                  />
                  <span className="ml-2 text-sm text-gray-500">#0f766e</span>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    name="secondary-color"
                    id="secondary-color"
                    className="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value="#2563eb"
                  />
                  <span className="ml-2 text-sm text-gray-500">#2563eb</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Customize your preferences for the platform.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                  Distance Units
                </label>
                <div className="mt-1">
                  <select
                    id="units"
                    name="units"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={accountSettings.units}
                    onChange={(e) => setAccountSettings({...accountSettings, units: e.target.value})}
                  >
                    <option value="miles">Miles</option>
                    <option value="kilometers">Kilometers</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="time-format" className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <div className="mt-1">
                  <select
                    id="time-format"
                    name="time-format"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={accountSettings.timeFormat}
                    onChange={(e) => setAccountSettings({...accountSettings, timeFormat: e.target.value})}
                  >
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <div className="mt-1">
                  <select
                    id="language"
                    name="language"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={accountSettings.language}
                    onChange={(e) => setAccountSettings({...accountSettings, language: e.target.value})}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <div className="mt-1">
                  <select
                    id="theme"
                    name="theme"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={accountSettings.theme}
                    onChange={(e) => setAccountSettings({...accountSettings, theme: e.target.value})}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Analytics Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your analytics preferences and data usage.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="usage-data"
                    name="usage-data"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="usage-data" className="font-medium text-gray-700">Share anonymous usage data</label>
                  <p className="text-gray-500">Help us improve TowTrace by sharing anonymous usage statistics.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="performance-tracking"
                    name="performance-tracking"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="performance-tracking" className="font-medium text-gray-700">Performance tracking</label>
                  <p className="text-gray-500">Track response times and system performance to optimize your experience.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="personalized-analytics"
                    name="personalized-analytics"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="personalized-analytics" className="font-medium text-gray-700">Personalized analytics</label>
                  <p className="text-gray-500">Receive insights and recommendations based on your usage patterns.</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Note:</span> Data exports have been moved to the reporting section for Premium and Enterprise subscribers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose how you want to be notified about important events.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notification Methods</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="email"
                        name="email"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.email}
                        onChange={() => handleNotificationChange('email')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">Get notified via email for important updates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="push"
                        name="push"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.push}
                        onChange={() => handleNotificationChange('push')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="push" className="font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <p className="text-gray-500">Receive push notifications on your mobile device.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="sms"
                        name="sms"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms" className="font-medium text-gray-700">
                        SMS Notifications
                      </label>
                      <p className="text-gray-500">Receive text messages for urgent notifications.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900">Notification Types</h4>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="weekly-report"
                        name="weekly-report"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.weeklyReport}
                        onChange={() => handleNotificationChange('weeklyReport')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="weekly-report" className="font-medium text-gray-700">
                        Weekly Reports
                      </label>
                      <p className="text-gray-500">Receive weekly summary reports of your activity.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="new-job"
                        name="new-job"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.newJob}
                        onChange={() => handleNotificationChange('newJob')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="new-job" className="font-medium text-gray-700">
                        New Jobs
                      </label>
                      <p className="text-gray-500">Be notified when new jobs are assigned to you.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="inspection"
                        name="inspection"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.inspection}
                        onChange={() => handleNotificationChange('inspection')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="inspection" className="font-medium text-gray-700">
                        Inspection Alerts
                      </label>
                      <p className="text-gray-500">Get notified about inspection results and issues.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="documentExpiration"
                        name="documentExpiration"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.documentExpiration}
                        onChange={() => handleNotificationChange('documentExpiration')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="documentExpiration" className="font-medium text-gray-700">
                        Document Expiration Alerts
                      </label>
                      <p className="text-gray-500">Be notified when driver documents are expiring (30, 60, 90 days).</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="driverArrival"
                        name="driverArrival"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={notifications.driverArrival}
                        onChange={() => handleNotificationChange('driverArrival')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="driverArrival" className="font-medium text-gray-700">
                        Driver Arrival Notifications
                      </label>
                      <p className="text-gray-500">Get notified when drivers arrive at pickup or dropoff locations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Feedback & Support</h3>
            <p className="mt-1 text-sm text-gray-500">
              Submit feature suggestions or report app issues to our support team.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <form className="space-y-6">
              <div>
                <label htmlFor="feedback-type" className="block text-sm font-medium text-gray-700">
                  Feedback Type
                </label>
                <select
                  id="feedback-type"
                  name="feedback-type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option>Feature Suggestion</option>
                  <option>Bug Report</option>
                  <option>General Feedback</option>
                  <option>Service Issue</option>
                  <option>Account Problem</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Brief summary of your feedback or issue"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Please provide details about your suggestion or issue..."
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Your feedback will be categorized using AI for faster response and sent to support@towtrace.com.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attachments (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, PDF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Billing & Subscription</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your subscription plan and payment information.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="border-b border-gray-200 pb-5">
              <h4 className="text-lg font-medium text-gray-900">Current Plan</h4>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h5 className="text-lg font-medium text-gray-900">Premium Plan</h5>
                    <p className="text-sm text-gray-500">$99/month, billed monthly</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Change Plan
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Upgrade/Downgrade Features
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900">Payment Method</h4>
              <div className="mt-4">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 4c0-1.1.9-2 2-2h12a2 2 0 012 2v2H4V4zm18 4v12c0 1.1-.9 2-2 2H4a2 2 0 01-2-2V8h20zM6 16h2v2H6v-2zm0-4h2v2H6v-2zm0-4h12v2H6V8zm12 4h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">Visa ending in 4242</h5>
                      <p className="text-sm text-gray-500">Expires 12/2025</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900">Billing History</h4>
              <div className="mt-4 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">Mar 1, 2025</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Monthly subscription - Premium Plan</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$99.00</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a href="#" className="text-primary-600 hover:text-primary-900">
                            Download <span className="sr-only">, March 2025</span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">Feb 1, 2025</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Monthly subscription - Premium Plan</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$99.00</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a href="#" className="text-primary-600 hover:text-primary-900">
                            Download <span className="sr-only">, February 2025</span>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">Jan 1, 2025</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Monthly subscription - Premium Plan</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">$99.00</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a href="#" className="text-primary-600 hover:text-primary-900">
                            Download <span className="sr-only">, January 2025</span>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">User Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage users in your TowTrace subscription. Add new users, modify roles, and control access.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Users in your subscription</h4>
              <p className="text-sm text-gray-500">
                You can manage all users associated with your TowTrace subscription. Add or remove users, and assign appropriate roles.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Active Users</h5>
                    <p className="text-xs text-gray-500 mt-1">Current active users: 5 of 20 (Premium plan)</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    {/* Fixed link URL to use router navigation */}
                    <Link 
                      href="/dashboard/settings/users"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Manage Users
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">User Roles</h5>
                    <p className="text-xs text-gray-500 mt-1">Role assignments determine what features users can access</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    {/* Fixed link URL to use router navigation */}
                    <Link 
                      href="/dashboard/settings/users/roles"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Manage Roles
                    </Link>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Pending Invitations</h5>
                    <p className="text-xs text-gray-500 mt-1">Invitations that have been sent but not yet accepted</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    {/* Fixed link URL to use router navigation */}
                    <Link 
                      href="/dashboard/settings/users?filter=invited"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      View Invitations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Upgrade your plan</h4>
              <p className="text-sm text-gray-500">
                Need to add more users? Consider upgrading your subscription plan.
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Current plan: Premium</p>
                  <p className="text-xs text-gray-500 mt-1">5 of 10 trucks (50% utilized)</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'quickbooks' && (
        <div className="flex justify-center">
          <Link 
            href="/dashboard/settings/quickbooks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Manage QuickBooks Integration
          </Link>
        </div>
      )}
      
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your security preferences and device access.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-md p-6">
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-medium text-gray-900">Change Password</h4>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="current-password"
                      id="current-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-4">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Update Password
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h4>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="rounded-md border border-transparent bg-primary-100 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900">Device Sessions</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Windows 11 - Chrome</p>
                      <p className="text-xs text-gray-500">Last active: Now (Current device)</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">iPhone 15 - Safari</p>
                      <p className="text-xs text-gray-500">Last active: 2 hours ago</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">MacBook Pro - Firefox</p>
                      <p className="text-xs text-gray-500">Last active: Yesterday at 2:30 PM</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Log Out of All Devices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}