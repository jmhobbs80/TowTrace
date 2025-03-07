'use client';

import { useState, useEffect } from 'react';
import SortableTable, { ColumnDef } from '@/components/SortableTable';

interface Driver {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'offline' | 'driving';
  lastActive: string;
}

interface EldLog {
  id: string;
  driverId: string;
  driverName: string;
  status: 'on_duty' | 'off_duty' | 'driving' | 'sleeping';
  startTime: string;
  endTime: string | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  duration: number; // in minutes
  vehicle?: {
    id: string;
    name: string;
    vin?: string;
  };
  notes?: string;
}

export default function EldLogsPage() {
  const [logs, setLogs] = useState<EldLog[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0], // today
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Fetch ELD logs data (mock data)
  useEffect(() => {
    // Simulate API call with a delay
    const timer = setTimeout(() => {
      // Mock drivers data
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Driver',
          email: 'john.driver@towtrace.com',
          status: 'active',
          lastActive: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Sarah Smith',
          email: 'sarah.smith@towtrace.com',
          status: 'driving',
          lastActive: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@towtrace.com',
          status: 'offline',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      ];
      
      // Mock logs data
      const mockLogs: EldLog[] = [
        {
          id: '1',
          driverId: '1',
          driverName: 'John Driver',
          status: 'driving',
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Main St, New York, NY',
          },
          duration: 120, // 2 hours
          vehicle: {
            id: 'v1',
            name: 'Truck 101',
            vin: '1HGCM82633A123456',
          },
        },
        {
          id: '2',
          driverId: '1',
          driverName: 'John Driver',
          status: 'on_duty',
          startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          endTime: null,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '456 Park Ave, New York, NY',
          },
          duration: 60, // 1 hour
          vehicle: {
            id: 'v1',
            name: 'Truck 101',
            vin: '1HGCM82633A123456',
          },
          notes: 'Lunch break',
        },
        {
          id: '3',
          driverId: '2',
          driverName: 'Sarah Smith',
          status: 'driving',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          endTime: null,
          location: {
            latitude: 34.0522,
            longitude: -118.2437,
            address: '789 Sunset Blvd, Los Angeles, CA',
          },
          duration: 300, // 5 hours
          vehicle: {
            id: 'v2',
            name: 'Truck 202',
            vin: '2FMDK4KC3DBC12345',
          },
        },
        {
          id: '4',
          driverId: '3',
          driverName: 'Mike Johnson',
          status: 'off_duty',
          startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          location: {
            latitude: 41.8781,
            longitude: -87.6298,
            address: '101 Michigan Ave, Chicago, IL',
          },
          duration: 600, // 10 hours
          vehicle: {
            id: 'v3',
            name: 'Truck 303',
            vin: '3VWSE69M74M123456',
          },
        },
        {
          id: '5',
          driverId: '3',
          driverName: 'Mike Johnson',
          status: 'sleeping',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          endTime: null,
          location: {
            latitude: 41.8781,
            longitude: -87.6298,
            address: 'Rest Area I-94, Chicago, IL',
          },
          duration: 120, // 2 hours
          vehicle: {
            id: 'v3',
            name: 'Truck 303',
            vin: '3VWSE69M74M123456',
          },
          notes: 'Mandatory rest period',
        },
      ];
      
      setDrivers(mockDrivers);
      setLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter logs based on selected filters
  const filteredLogs = logs.filter(log => {
    const matchesDriver = selectedDriver === 'all' || log.driverId === selectedDriver;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    const logStartDate = new Date(log.startTime).getTime();
    const filterStartDate = new Date(`${dateRange.start}T00:00:00`).getTime();
    const filterEndDate = new Date(`${dateRange.end}T23:59:59`).getTime();
    
    const matchesDate = logStartDate >= filterStartDate && logStartDate <= filterEndDate;
    
    return matchesDriver && matchesStatus && matchesDate;
  });

  // Format duration from minutes to readable format
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Get color for status badge
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'driving':
        return 'bg-green-100 text-green-800';
      case 'on_duty':
        return 'bg-blue-100 text-blue-800';
      case 'off_duty':
        return 'bg-gray-100 text-gray-800';
      case 'sleeping':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get formatted status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'on_duty':
        return 'On Duty';
      case 'off_duty':
        return 'Off Duty';
      case 'driving':
        return 'Driving';
      case 'sleeping':
        return 'Rest Period';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle clicking on a log to view details
  const handleLogClick = (logId: string) => {
    if (selectedLogId === logId) {
      setSelectedLogId(null);
    } else {
      setSelectedLogId(logId);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">ELD Logs</h2>
          <p className="mt-1 text-sm text-gray-500">
            View electronic logging device records for all drivers
          </p>
        </div>
        {/* Export button removed as per requirements */}
        <div className="mt-4 sm:mt-0">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Logs
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="driver-filter" className="block text-sm font-medium text-gray-700">Driver</label>
            <select
              id="driver-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="all">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="driving">Driving</option>
              <option value="on_duty">On Duty</option>
              <option value="off_duty">Off Duty</option>
              <option value="sleeping">Rest Period</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="start-date"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="end-date"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      {/* Driver status summary */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{driver.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg font-semibold text-gray-900">
                        {driver.status === 'driving' ? 'Driving Now' : 
                         driver.status === 'active' ? 'On Duty' : 'Offline'}
                      </div>
                    </dd>
                    <dd className="mt-1 text-sm text-gray-500">
                      Last active: {new Date(driver.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </dd>
                  </dl>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === 'driving' ? 'bg-green-100 text-green-800' :
                      driver.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Logs table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-4">
        {isLoading ? (
          <div className="px-6 py-16 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              <span className="mt-4 text-gray-500">Loading ELD logs...</span>
            </div>
          </div>
        ) : (
          <SortableTable
            data={filteredLogs}
            columns={[
              {
                id: 'driver',
                header: 'Driver',
                accessorKey: 'driverName',
                cell: ({ row }) => (
                  <div className="text-sm font-medium text-primary-600">{row.driverName}</div>
                ),
              },
              {
                id: 'status',
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                    {getStatusText(row.status)}
                  </span>
                ),
              },
              {
                id: 'timeFrame',
                header: 'Time Frame',
                accessorKey: 'startTime',
                cell: ({ row }) => (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {formatDate(row.startTime)}
                      {row.endTime ? ` - ${formatDate(row.endTime)}` : ' (Current)'}
                    </span>
                  </div>
                ),
              },
              {
                id: 'duration',
                header: 'Duration',
                accessorKey: 'duration',
                cell: ({ row }) => (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {row.duration > 0 ? formatDuration(row.duration) : 'Active'}
                  </span>
                ),
              },
              {
                id: 'vehicle',
                header: 'Vehicle',
                cell: ({ row }) => (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {row.vehicle?.name || 'No vehicle assigned'}
                  </div>
                ),
              },
              {
                id: 'location',
                header: 'Location',
                cell: ({ row }) => (
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {row.location.address || 'Unknown location'}
                  </div>
                ),
              },
              {
                id: 'details',
                header: 'Details',
                sortable: false,
                cell: ({ row }) => (
                  <button 
                    onClick={() => handleLogClick(row.id)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    {selectedLogId === row.id ? 'Hide Details' : 'View Details'}
                  </button>
                ),
              },
            ]}
            defaultSortColumn="startTime"
            defaultSortDirection="desc"
            storageKey="eld-logs-table"
            emptyMessage="No logs found matching your criteria. Try adjusting your filters to see more results."
          />
        )}
        
        {/* Show expanded details for selected log */}
        {selectedLogId && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            {filteredLogs
              .filter(log => log.id === selectedLogId)
              .map(log => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Log Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {log.location.address || 'Unknown location'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {log.location.latitude.toFixed(4)}, {log.location.longitude.toFixed(4)}
                      </p>
                    </div>
                    
                    {log.vehicle && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Vehicle</h4>
                        <p className="mt-1 text-sm text-gray-900">{log.vehicle.name}</p>
                        {log.vehicle.vin && (
                          <p className="mt-1 text-xs text-gray-500">VIN: {log.vehicle.vin}</p>
                        )}
                      </div>
                    )}
                    
                    {log.notes && (
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                        <p className="mt-1 text-sm text-gray-900">{log.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}