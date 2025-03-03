import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCurrentUser, User } from '../../lib/auth';

/**
 * Main Dashboard Page
 * Provides an overview of the system with role-specific information
 */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get current user on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);
  
  // Example job data for demonstration
  const recentJobs = [
    {
      id: '1001',
      status: 'active',
      from: 'Los Angeles, CA',
      to: 'Phoenix, AZ',
      driverName: 'Michael Thompson',
      vehicleCount: 2,
      date: new Date(Date.now() - 86400000) // Yesterday
    },
    {
      id: '1002',
      status: 'pending',
      from: 'San Francisco, CA',
      to: 'Portland, OR',
      driverName: 'Sarah Johnson',
      vehicleCount: 1,
      date: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      id: '1003',
      status: 'completed',
      from: 'Denver, CO',
      to: 'Salt Lake City, UT',
      driverName: 'David Wilson',
      vehicleCount: 3,
      date: new Date(Date.now() - 259200000) // 3 days ago
    },
    {
      id: '1004',
      status: 'completed',
      from: 'Seattle, WA',
      to: 'Vancouver, BC',
      driverName: 'James Miller',
      vehicleCount: 1,
      date: new Date(Date.now() - 345600000) // 4 days ago
    },
    {
      id: '1005',
      status: 'cancelled',
      from: 'Dallas, TX',
      to: 'Houston, TX',
      driverName: 'Robert Brown',
      vehicleCount: 2,
      date: new Date(Date.now() - 432000000) // 5 days ago
    }
  ];
  
  // Statistics for the dashboard cards
  const statistics = {
    admin: [
      {
        name: 'Total Jobs',
        value: '86',
        change: '+12%',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-blue-600 to-blue-800',
        link: '/dashboard/jobs'
      },
      {
        name: 'Active Drivers',
        value: '12',
        change: '+2',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-green-500 to-green-700',
        link: '/dashboard/drivers'
      },
      {
        name: 'Vehicles in Transit',
        value: '28',
        change: '+5',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-purple-500 to-purple-700',
        link: '/dashboard/vehicles'
      },
      {
        name: 'Monthly Revenue',
        value: '$38,240',
        change: '+18%',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
        link: '/dashboard/quickbooks'
      }
    ],
    dispatcher: [
      {
        name: 'Active Jobs',
        value: '14',
        change: '+2',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-blue-600 to-blue-800',
        link: '/dashboard/jobs'
      },
      {
        name: 'Available Drivers',
        value: '6',
        change: '-1',
        increasing: false,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-green-500 to-green-700',
        link: '/dashboard/drivers'
      },
      {
        name: 'Pending Jobs',
        value: '8',
        change: '+3',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-700',
        link: '/dashboard/jobs?status=pending'
      },
      {
        name: 'Vehicle Inspections Due',
        value: '3',
        change: '0',
        increasing: false,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-red-500 to-red-700',
        link: '/dashboard/inspections'
      }
    ],
    driver: [
      {
        name: 'Current Assignment',
        value: '1',
        change: 'Active',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-blue-600 to-blue-800',
        link: '/dashboard/jobs/current'
      },
      {
        name: 'Vehicle Status',
        value: 'Good',
        change: 'No issues',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-green-500 to-green-700',
        link: '/dashboard/vehicles/status'
      },
      {
        name: 'Upcoming Jobs',
        value: '2',
        change: 'Next: Tomorrow',
        increasing: true,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-purple-500 to-purple-700',
        link: '/dashboard/jobs/upcoming'
      },
      {
        name: 'Inspection Due',
        value: 'In 3 days',
        change: 'Required',
        increasing: false,
        icon: (
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-700',
        link: '/dashboard/inspections'
      }
    ]
  };
  
  // Get statistics based on user role
  const getStatsForUser = () => {
    if (!user) return statistics.admin;
    
    switch (user.role) {
      case 'admin':
        return statistics.admin;
      case 'dispatcher':
        return statistics.dispatcher;
      case 'driver':
        return statistics.driver;
      default:
        return statistics.admin;
    }
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <Head>
        <title>Dashboard | TowTrace</title>
        <meta name="description" content="TowTrace Transport Management Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DashboardLayout title={`Welcome, ${user?.name || 'User'}`}>
        {user?.role === 'driver' && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You have a job active right now. <Link href="/dashboard/jobs/current"><a className="font-medium underline">View details</a></Link>
                </p>
              </div>
            </div>
          </div>
        )}
              
        {/* Dashboard Stats Cards */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {getStatsForUser().map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.increasing ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.increasing ? (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="sr-only">{stat.increasing ? 'Increased' : 'Decreased'} by</span>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href={stat.link}>
                    <a className="font-medium text-blue-600 hover:text-blue-500">View details</a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        {user?.role !== 'driver' && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/jobs/new">
                <a className="relative block px-4 py-5 bg-white shadow rounded-lg overflow-hidden hover:bg-gray-50 text-center transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-blue-600 mx-auto h-8 w-8 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Create Job</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a new transport job</p>
                </a>
              </Link>
              
              <Link href="/dashboard/vehicles/scan">
                <a className="relative block px-4 py-5 bg-white shadow rounded-lg overflow-hidden hover:bg-gray-50 text-center transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-blue-600 mx-auto h-8 w-8 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Scan VIN</h3>
                  <p className="mt-1 text-sm text-gray-500">Scan or add a vehicle VIN</p>
                </a>
              </Link>
              
              <Link href="/dashboard/jobs/assign">
                <a className="relative block px-4 py-5 bg-white shadow rounded-lg overflow-hidden hover:bg-gray-50 text-center transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-blue-600 mx-auto h-8 w-8 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Assign Driver</h3>
                  <p className="mt-1 text-sm text-gray-500">Assign jobs to drivers</p>
                </a>
              </Link>
              
              <Link href="/dashboard/fleet">
                <a className="relative block px-4 py-5 bg-white shadow rounded-lg overflow-hidden hover:bg-gray-50 text-center transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <div className="text-blue-600 mx-auto h-8 w-8 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Track Fleet</h3>
                  <p className="mt-1 text-sm text-gray-500">View real-time locations</p>
                </a>
              </Link>
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          
          <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {recentJobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <a className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            Job #{job.id} {job.vehicleCount > 1 ? `(${job.vehicleCount} vehicles)` : ''}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {job.from} to {job.to}
                            </p>
                            {user?.role !== 'driver' && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {job.driverName}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p>
                              {job.status === 'completed' ? 'Completed' : job.status === 'cancelled' ? 'Cancelled' : 'Updated'} on <time dateTime={job.date.toISOString()}>{job.date.toLocaleDateString()}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-center">
              <Link href="/dashboard/jobs">
                <a className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  View All Jobs
                </a>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}