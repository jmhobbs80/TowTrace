'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SortableTable, { ColumnDef } from '@/components/SortableTable';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState(statusParam || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample jobs data
  const jobs = [
    { id: 101, client: "ABC Corp", phone: "(555) 111-2222", pickupLocation: "123 Main St, Anytown", dropoffLocation: "456 Oak Ave, Othertown", driver: "John Smith", vehicle: "Honda Accord", status: "In Progress", createdAt: "2023-05-15 09:30", eta: "2023-05-15 13:45" },
    { id: 102, client: "XYZ Inc", phone: "(555) 333-4444", pickupLocation: "789 Pine St, Somewhere", dropoffLocation: "321 Elm St, Nowhere", driver: "Michael Brown", vehicle: "Tesla Model S", status: "Scheduled", createdAt: "2023-05-14 14:20", eta: "2023-05-16 10:00" },
    { id: 103, client: "Acme LLC", phone: "(555) 555-6666", pickupLocation: "555 Cedar Rd, Anyplace", dropoffLocation: "777 Maple Ave, Someplace", driver: "Unassigned", vehicle: "Unassigned", status: "Pending", createdAt: "2023-05-15 11:15", eta: "N/A" },
    { id: 104, client: "Global Industries", phone: "(555) 777-8888", pickupLocation: "888 Birch St, Townsville", dropoffLocation: "999 Spruce Ave, Cityville", driver: "Sarah Johnson", vehicle: "Chevrolet Malibu", status: "Completed", createdAt: "2023-05-13 08:00", eta: "2023-05-13 12:30" },
    { id: 105, client: "Local Business", phone: "(555) 999-0000", pickupLocation: "111 Cherry Ln, Downtown", dropoffLocation: "222 Apple St, Uptown", driver: "Emily Davis", vehicle: "BMW X5", status: "Cancelled", createdAt: "2023-05-14 16:45", eta: "N/A" },
  ];
  
  // Initialize filtered jobs with all jobs or filtered by status if provided in URL
  const [filteredJobs, setFilteredJobs] = useState(() => {
    if (statusParam && statusParam === 'completed') {
      return jobs.filter(job => job.status === 'Completed');
    }
    return jobs;
  });
  
  // Filter jobs based on search term and status
  useEffect(() => {
    // Convert status filter to match the case in the data
    const formattedStatus = statusFilter === 'completed' ? 'Completed' : 
                            statusFilter === 'in-progress' ? 'In Progress' :
                            statusFilter === 'scheduled' ? 'Scheduled' :
                            statusFilter === 'pending' ? 'Pending' :
                            statusFilter === 'cancelled' ? 'Cancelled' : '';
    
    let filtered = jobs;
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === formattedStatus);
    }
    
    // Apply search filter if search term exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.client.toLowerCase().includes(term) ||
        job.driver.toLowerCase().includes(term) ||
        job.pickupLocation.toLowerCase().includes(term) ||
        job.dropoffLocation.toLowerCase().includes(term) ||
        job.id.toString().includes(term)
      );
    }
    
    setFilteredJobs(filtered);
  }, [statusFilter, searchTerm, jobs]);
  
  // Debounce function for search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage transportation and delivery jobs</p>
        </div>
        <div>
          <Link href="/dashboard/jobs/new" className="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Job
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Jobs</h2>
          <div className="flex items-center">
            <div className="mr-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>
            <select 
              className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <SortableTable
          data={filteredJobs}
          columns={[
            {
              id: 'id',
              header: 'ID',
              accessorKey: 'id',
              cell: ({ row }) => (
                <span className="font-medium">#{row.id}</span>
              ),
            },
            {
              id: 'client',
              header: 'Client',
              accessorKey: 'client',
              cell: ({ row }) => (
                <div>
                  <div>{row.client}</div>
                  <div className="text-xs text-gray-500">{row.phone}</div>
                </div>
              ),
            },
            {
              id: 'pickup',
              header: 'Pickup',
              accessorKey: 'pickupLocation',
              cell: ({ row }) => (
                <div className="truncate max-w-[200px]">{row.pickupLocation}</div>
              ),
            },
            {
              id: 'dropoff',
              header: 'Dropoff',
              accessorKey: 'dropoffLocation',
              cell: ({ row }) => (
                <div className="truncate max-w-[200px]">{row.dropoffLocation}</div>
              ),
            },
            {
              id: 'driver',
              header: 'Driver/Vehicle',
              accessorKey: 'driver',
              cell: ({ row }) => (
                <div>
                  <div>{row.driver}</div>
                  <div className="text-xs text-gray-500">{row.vehicle}</div>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              cell: ({ row }) => (
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  row.status === 'In Progress' 
                    ? 'bg-blue-100 text-blue-800' 
                    : row.status === 'Scheduled' 
                    ? 'bg-purple-100 text-purple-800' 
                    : row.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : row.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {row.status}
                </span>
              ),
            },
            {
              id: 'created',
              header: 'Created',
              accessorKey: 'createdAt',
              cell: ({ row }) => (
                <div className="text-gray-500">
                  <div>{row.createdAt}</div>
                  <div className="text-xs">ETA: {row.eta}</div>
                </div>
              ),
            },
            {
              id: 'actions',
              header: 'Actions',
              sortable: false,
              cell: ({ row }) => (
                <div className="flex space-x-2">
                  <Link href={`/dashboard/jobs/${row.id}`} className="text-gray-600 hover:text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                  <Link href={`/dashboard/jobs/${row.id}/edit`} className="text-gray-600 hover:text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </Link>
                </div>
              ),
            },
          ]}
          defaultSortColumn="id"
          defaultSortDirection="asc"
          storageKey="jobs-table"
          emptyMessage="No jobs found matching your criteria."
        />
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> jobs
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Job Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-32 text-sm text-gray-600">In Progress</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm font-medium ml-2">1</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-sm text-gray-600">Scheduled</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm font-medium ml-2">1</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-sm text-gray-600">Pending</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm font-medium ml-2">1</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-sm text-gray-600">Completed</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm font-medium ml-2">1</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 text-sm text-gray-600">Cancelled</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="w-10 text-right text-sm font-medium ml-2">1</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-4 py-1">
              <div className="text-sm font-medium">Job #104 completed</div>
              <div className="text-xs text-gray-500">Today, 10:45 AM by Sarah Johnson</div>
            </div>
            
            <div className="border-l-2 border-green-500 pl-4 py-1">
              <div className="text-sm font-medium">Job #102 assigned to Michael Brown</div>
              <div className="text-xs text-gray-500">Today, 9:32 AM by Admin</div>
            </div>
            
            <div className="border-l-2 border-yellow-500 pl-4 py-1">
              <div className="text-sm font-medium">New job #105 created</div>
              <div className="text-xs text-gray-500">Today, 8:15 AM by Admin</div>
            </div>
            
            <div className="border-l-2 border-red-500 pl-4 py-1">
              <div className="text-sm font-medium">Job #103 pickup location updated</div>
              <div className="text-xs text-gray-500">Yesterday, 4:20 PM by Admin</div>
            </div>
            
            <div className="border-l-2 border-purple-500 pl-4 py-1">
              <div className="text-sm font-medium">Job #101 status changed to In Progress</div>
              <div className="text-xs text-gray-500">Yesterday, 2:45 PM by John Smith</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View All Activities
            </button>
          </div>
        </div>
      </div>
    </>
  );
}