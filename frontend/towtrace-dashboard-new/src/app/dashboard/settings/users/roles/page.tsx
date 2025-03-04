'use client';

import { useState } from 'react';
import Link from 'next/link';

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // IDs of permissions
  isDefault: boolean;
  isSystem: boolean;
  userCount: number;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Admin',
      description: 'Full access to all features and settings',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
      isDefault: false,
      isSystem: true,
      userCount: 1,
    },
    {
      id: '2',
      name: 'Dispatcher',
      description: 'Manage drivers, vehicles, and jobs',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      isDefault: true,
      isSystem: true,
      userCount: 2,
    },
    {
      id: '3',
      name: 'Driver',
      description: 'Access to job assignments and vehicle inspection',
      permissions: ['1', '2', '3'],
      isDefault: false,
      isSystem: true,
      userCount: 3,
    },
    {
      id: '4',
      name: 'Viewer',
      description: 'Read-only access to all data',
      permissions: ['1', '5', '8'],
      isDefault: false,
      isSystem: false,
      userCount: 0,
    },
  ]);

  const permissions: Permission[] = [
    { id: '1', name: 'View Dashboard', description: 'Access to view dashboard', category: 'Dashboard' },
    { id: '2', name: 'View Jobs', description: 'View job listings and details', category: 'Jobs' },
    { id: '3', name: 'Accept/Complete Jobs', description: 'Accept and complete assigned jobs', category: 'Jobs' },
    { id: '4', name: 'Create Jobs', description: 'Create new jobs', category: 'Jobs' },
    { id: '5', name: 'View Vehicles', description: 'View vehicle listings and details', category: 'Vehicles' },
    { id: '6', name: 'Add Vehicles', description: 'Add new vehicles to the system', category: 'Vehicles' },
    { id: '7', name: 'Edit Vehicles', description: 'Edit vehicle information', category: 'Vehicles' },
    { id: '8', name: 'View Drivers', description: 'View driver listings and details', category: 'Drivers' },
    { id: '9', name: 'Assign Jobs', description: 'Assign jobs to drivers', category: 'Dispatch' },
    { id: '10', name: 'View Reports', description: 'View reports and analytics', category: 'Reports' },
    { id: '11', name: 'Manage Users', description: 'Add, edit and remove users', category: 'Administration' },
    { id: '12', name: 'Manage Roles', description: 'Create, edit and assign roles', category: 'Administration' },
    { id: '13', name: 'Billing Access', description: 'View and manage billing information', category: 'Administration' },
    { id: '14', name: 'API Access', description: 'Use API to integrate with other systems', category: 'System' },
    { id: '15', name: 'System Settings', description: 'Change system-wide settings', category: 'System' },
  ];

  const [activeRole, setActiveRole] = useState<Role | null>(roles[0]);
  const [showPermissionDetails, setShowPermissionDetails] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Group permissions by category for display
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Handle creating a new role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRole.name.trim() === '') return;
    
    const createdRole: Role = {
      id: Math.random().toString(36).substring(7),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      isDefault: false,
      isSystem: false,
      userCount: 0,
    };
    
    setRoles([...roles, createdRole]);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowCreateRoleModal(false);
  };

  // Handle toggling a permission in the create/edit forms
  const togglePermission = (permissionId: string) => {
    if (newRole.permissions.includes(permissionId)) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter(id => id !== permissionId),
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permissionId],
      });
    }
  };

  // Get permissions for a role
  const getRolePermissions = (role: Role) => {
    return permissions.filter(permission => role.permissions.includes(permission.id));
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Role Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define and customize user roles in your subscription.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowCreateRoleModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Role
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Role listing (left side) */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">User Roles</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {roles.map((role) => (
                <li key={role.id}>
                  <button
                    onClick={() => setActiveRole(role)}
                    className={`w-full px-4 py-4 flex items-center hover:bg-gray-50 focus:outline-none ${
                      activeRole?.id === role.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {role.name}
                        </p>
                        {role.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                        {role.isSystem && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            System
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-500 truncate mr-3">
                          {role.userCount} users
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {role.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Role details (right side) */}
        <div className="lg:col-span-2">
          {activeRole && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">{activeRole.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{activeRole.description}</p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <div className="flex space-x-3">
                    <button
                      disabled={activeRole.isSystem}
                      className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md ${
                        activeRole.isSystem
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      disabled={activeRole.isSystem}
                      className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md ${
                        activeRole.isSystem
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-900">Role Details</h4>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <div className="border rounded-md bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">Users with this role</p>
                        <p className="mt-1 text-lg font-medium text-gray-900">{activeRole.userCount}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <div className="border rounded-md bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">Permissions</p>
                        <p className="mt-1 text-lg font-medium text-gray-900">{activeRole.permissions.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">Permissions</h4>
                    <button
                      onClick={() => setShowPermissionDetails(!showPermissionDetails)}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      {showPermissionDetails ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                  
                  {/* Permissions list */}
                  <div className="space-y-6">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        <h5 className="text-sm font-medium text-gray-900 mb-3">{category}</h5>
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {categoryPermissions.map((permission) => (
                            <li key={permission.id}>
                              <div className={`border rounded-md px-3 py-2 ${
                                activeRole.permissions.includes(permission.id)
                                  ? 'bg-primary-50 border-primary-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center">
                                  {activeRole.permissions.includes(permission.id) ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                                </div>
                                {showPermissionDetails && (
                                  <p className="mt-1 text-xs text-gray-500 pl-7">{permission.description}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create new role modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowCreateRoleModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <form onSubmit={handleCreateRole}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">Create New Role</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
                            Role Name
                          </label>
                          <input
                            type="text"
                            name="role-name"
                            id="role-name"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            placeholder="e.g., Office Manager"
                          />
                        </div>
                        <div>
                          <label htmlFor="role-description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="role-description"
                            id="role-description"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={newRole.description}
                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                            placeholder="Brief description of this role's responsibilities"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                          </label>
                          <div className="max-h-80 overflow-y-auto border rounded-md p-3">
                            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                              <div key={category} className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                                <div className="space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start">
                                      <div className="flex h-5 items-center">
                                        <input
                                          id={`permission-${permission.id}`}
                                          name={`permission-${permission.id}`}
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                          checked={newRole.permissions.includes(permission.id)}
                                          onChange={() => togglePermission(permission.id)}
                                        />
                                      </div>
                                      <div className="ml-3 text-sm">
                                        <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                                          {permission.name}
                                        </label>
                                        <p className="text-gray-500">{permission.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Role
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateRoleModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard/settings/users" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to User Management
        </Link>
      </div>
    </div>
  );
}