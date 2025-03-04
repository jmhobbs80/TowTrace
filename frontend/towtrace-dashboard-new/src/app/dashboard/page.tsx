'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Sample data
  const jobs = [
    { 
      id: 101, 
      client: "ABC Corp", 
      pickup: "123 Main St", 
      dropoff: "456 Oak Ave", 
      driver: "John Smith", 
      status: "In Progress",
      vehicles: 2,
      scheduled: "Today, 8:00 AM"
    },
    { 
      id: 102, 
      client: "XYZ Inc", 
      pickup: "789 Pine St", 
      dropoff: "321 Elm St", 
      driver: "Michael Brown", 
      status: "Scheduled",
      vehicles: 1,
      scheduled: "Today, 2:30 PM"
    },
    { 
      id: 103, 
      client: "Acme LLC", 
      pickup: "555 Cedar Rd", 
      dropoff: "777 Maple Ave", 
      driver: "Unassigned", 
      status: "Pending",
      vehicles: 3,
      scheduled: "Tomorrow, 9:15 AM"
    },
  ];
  
  // Recent activities
  const activities = [
    {
      id: 1,
      description: "Vehicle #1235 completed delivery",
      time: "Today, 10:45 AM",
      type: "delivery"
    },
    {
      id: 2,
      description: "New job #104 created for client Delta Corp",
      time: "Today, 9:32 AM",
      type: "job_created"
    },
    {
      id: 3,
      description: "Driver Michael Brown started shift",
      time: "Today, 8:15 AM",
      type: "driver_shift"
    },
    {
      id: 4,
      description: "Pre-trip inspection completed for Vehicle #1237",
      time: "Today, 7:50 AM",
      type: "inspection"
    },
    {
      id: 5,
      description: "Job #100 invoice generated and sent to billing",
      time: "Yesterday, 5:22 PM",
      type: "invoice"
    }
  ];
  
  // Function to get the status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'badge badge-primary';
      case 'Scheduled':
        return 'badge badge-success';
      case 'Pending':
        return 'badge badge-warning';
      case 'Completed':
        return 'badge badge-success';
      case 'Cancelled':
        return 'badge badge-danger';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return (
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        );
      case 'job_created':
        return (
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'driver_shift':
        return (
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        );
      case 'inspection':
        return (
          <div className="p-2 bg-orange-100 rounded-full text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        );
      case 'invoice':
        return (
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}!
        </h2>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your fleet today
        </p>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/jobs/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Job
        </Link>
        
        <Link href="/dashboard/jobs/scan" className="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
          </svg>
          Scan VIN
        </Link>
        
        {/* Only show Track Fleet button for admin and dispatch roles */}
        {(user?.role === 'admin' || user?.role === 'dispatch') && (
          <Link href="/dashboard/drivers" className="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            Track Fleet
          </Link>
        )}
        
        {/* For drivers, show battery-friendly GPS tracking info */}
        {user?.role === 'driver' && (
          <div className="flex items-center bg-green-50 text-green-700 rounded-md px-3 py-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Battery-friendly GPS tracking active
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/dashboard/vehicles" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
          <div className="mb-4 md:mb-0">
            <div className="text-gray-500 text-sm font-medium mb-1">Active Trucks</div>
            <div className="text-3xl font-bold text-gray-900">12</div>
          </div>
          <div className="p-3 bg-primary-100 rounded-full text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        </Link>
        
        <Link href="/dashboard/drivers" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
          <div className="mb-4 md:mb-0">
            <div className="text-gray-500 text-sm font-medium mb-1">Available Drivers</div>
            <div className="text-3xl font-bold text-gray-900">8</div>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </Link>
        
        <Link href="/dashboard/jobs" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
          <div className="mb-4 md:mb-0">
            <div className="text-gray-500 text-sm font-medium mb-1">Jobs Today</div>
            <div className="text-3xl font-bold text-gray-900">15</div>
          </div>
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
        </Link>
        
        <Link href="/dashboard/jobs" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
          <div className="mb-4 md:mb-0">
            <div className="text-gray-500 text-sm font-medium mb-1">Completed Jobs</div>
            <div className="text-3xl font-bold text-gray-900">42</div>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="#" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                {getActivityIcon(activity.type)}
                <div>
                  <div className="text-gray-900 font-medium">{activity.description}</div>
                  <div className="text-gray-500 text-sm">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Jobs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Active Jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700">
              View all jobs
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table-elegant">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Client</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td className="font-medium">#{job.id}</td>
                    <td>{job.client}</td>
                    <td>
                      {job.driver === 'Unassigned' ? (
                        <span className="text-yellow-600 font-medium">{job.driver}</span>
                      ) : (
                        job.driver
                      )}
                    </td>
                    <td>
                      <span className={getStatusBadge(job.status)}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/dashboard/jobs/${job.id}`} className="text-primary-600 hover:text-primary-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Link href="/dashboard/jobs/new" className="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New Job
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}