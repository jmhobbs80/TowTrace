'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'dispatcher' | 'driver';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  status: 'active' | 'invited' | 'disabled';
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'driver' as UserRole,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users (mock data for now)
  useEffect(() => {
    // In a real app, this would fetch from an API
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@towtrace.com',
        role: 'admin',
        lastLogin: new Date().toISOString(),
        status: 'active',
      },
      {
        id: '2',
        name: 'John Driver',
        email: 'john.driver@towtrace.com',
        role: 'driver',
        lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'active',
      },
      {
        id: '3',
        name: 'Sarah Dispatcher',
        email: 'sarah.dispatcher@towtrace.com',
        role: 'dispatcher',
        lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'active',
      },
      {
        id: '4',
        name: 'Mike Driver',
        email: 'mike.driver@towtrace.com',
        role: 'driver',
        lastLogin: null,
        status: 'invited',
      },
      {
        id: '5',
        name: 'Emily Dispatcher',
        email: 'emily.dispatcher@towtrace.com',
        role: 'dispatcher',
        lastLogin: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        status: 'active',
      },
      {
        id: '6',
        name: 'David Driver',
        email: 'david.driver@towtrace.com',
        role: 'driver',
        lastLogin: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
        status: 'disabled',
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 800); // Simulate API delay
  }, []);

  // Handle inviting a new user
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this to your API
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      ...inviteData,
      status: 'invited',
    };

    setUsers([...users, newUser]);
    setInviteData({ email: '', name: '', role: 'driver' });
    setShowInviteModal(false);
  };

  // Handle role change for a user
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Handle changing a user's status
  const handleStatusChange = (userId: string, newStatus: 'active' | 'invited' | 'disabled') => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  // Handle selecting a user
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: 'delete' | 'disable' | 'enable') => {
    if (action === 'delete') {
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
    } else if (action === 'disable') {
      setUsers(
        users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, status: 'disabled' } : user
        )
      );
    } else if (action === 'enable') {
      setUsers(
        users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        )
      );
    }
    
    setSelectedUsers([]);
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage users in your TowTrace subscription.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Invite User
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Search users by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <select
              id="role-filter"
              name="role-filter"
              className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="dispatcher">Dispatchers Only</option>
              <option value="driver">Drivers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md flex items-center">
          <span className="text-sm text-gray-700 mr-4">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </span>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('enable')}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Enable
            </button>
            <button
              onClick={() => handleBulkAction('disable')}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Disable
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Users table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-white">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500">Loading users...</span>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map((user) => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Last Login
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-base font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={selectedUsers.includes(user.id) ? 'bg-primary-50' : undefined}>
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="font-medium text-primary-800">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="driver">Driver</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'invited'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'active'
                          ? 'Active'
                          : user.status === 'invited'
                          ? 'Invited'
                          : 'Disabled'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          const newStatus = user.status === 'active' ? 'disabled' : 'active';
                          handleStatusChange(user.id, newStatus);
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        {user.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => {
                          // In real app, you'd confirm before deleting
                          setUsers(users.filter((u) => u.id !== user.id));
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite user modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowInviteModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleInviteUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                        Invite New User
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={inviteData.name}
                            onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={inviteData.role}
                            onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                          >
                            <option value="admin">Admin</option>
                            <option value="dispatcher">Dispatcher</option>
                            <option value="driver">Driver</option>
                          </select>
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
                    Send Invitation
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/settings" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Settings
        </Link>
        
        <Link href="/dashboard/settings/users/roles" className="mt-4 sm:mt-0 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Manage Roles
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}