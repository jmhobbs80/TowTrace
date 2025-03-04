'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InspectionsPage() {
  const [inspectionStatus, setInspectionStatus] = useState('all');
  
  // Mock inspection data
  const inspections = [
    {
      id: '1',
      vehicle: 'Tow Truck #103',
      driver: 'John Smith',
      date: '2025-03-01',
      status: 'passed',
      issues: [],
    },
    {
      id: '2',
      vehicle: 'Flatbed #205',
      driver: 'Sarah Johnson',
      date: '2025-02-28',
      status: 'passed',
      issues: [],
    },
    {
      id: '3',
      vehicle: 'Tow Truck #107',
      driver: 'Michael Brown',
      date: '2025-02-27',
      status: 'failed',
      issues: ['Brake light malfunction', 'Low tire pressure'],
    },
    {
      id: '4',
      vehicle: 'Wrecker #302',
      driver: 'Jessica Davis',
      date: '2025-02-26',
      status: 'passed',
      issues: [],
    },
    {
      id: '5',
      vehicle: 'Flatbed #201',
      driver: 'David Wilson',
      date: '2025-02-25',
      status: 'failed',
      issues: ['Windshield crack', 'Missing safety equipment'],
    },
  ];
  
  // Filter inspections based on status
  const filteredInspections = inspectionStatus === 'all' 
    ? inspections 
    : inspections.filter(inspection => inspection.status === inspectionStatus);
  
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Recent Vehicle Inspections</h2>
          <p className="mt-1 text-sm text-gray-500">
            View pre-trip inspection reports from all drivers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/dashboard/inspections/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Inspection
          </Link>
          <button className="ml-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            Export Reports
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Search inspections"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <select
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              value={inspectionStatus}
              onChange={(e) => setInspectionStatus(e.target.value)}
            >
              <option value="all">All Inspections</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Inspections List */}
      <div className="overflow-hidden rounded-md border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredInspections.length > 0 ? (
            filteredInspections.map((inspection) => (
              <li key={inspection.id} className="hover:bg-gray-50">
                <div className="group relative flex items-center px-4 py-5 sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                      <div>
                        <p className="truncate text-sm font-medium text-primary-600">{inspection.vehicle}</p>
                        <p className="mt-1 truncate text-sm text-gray-500">Driver: {inspection.driver}</p>
                      </div>
                      <div className="hidden md:block">
                        <div>
                          <p className="text-sm text-gray-900">
                            Date: {new Date(inspection.date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            {inspection.status === 'passed' ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Failed
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        {inspection.issues.length > 0 ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Issues:</p>
                            <ul className="mt-1 text-sm text-gray-500 list-disc pl-5">
                              {inspection.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No issues reported</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/inspections/${inspection.id}`}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-10 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm font-semibold text-gray-900">No inspections found</p>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new inspection report.
              </p>
            </li>
          )}
        </ul>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inspection Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Passed Inspections</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">3</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <span>60%</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed Inspections</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">2</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <span>40%</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Inspections This Month</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">5</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z" clipRule="evenodd" />
                        </svg>
                        <span>20%</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}