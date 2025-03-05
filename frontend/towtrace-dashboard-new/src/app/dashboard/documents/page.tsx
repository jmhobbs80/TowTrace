'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { format, isBefore, addDays } from 'date-fns';

type DocumentStatus = 'valid' | 'expiringSoon' | 'expired';

interface DriverDocument {
  id: string;
  driverId: string;
  driverName: string;
  documentType: string;
  title: string;
  documentNumber: string;
  expiryDate: Date;
  requiresExpiry: boolean;
  imageUri: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastUpdated: Date;
}

interface ExpirationFilter {
  days: number;
  label: string;
  active: boolean;
}

const DocumentExpirationDashboard = () => {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expirationFilters, setExpirationFilters] = useState<ExpirationFilter[]>([
    { days: 30, label: '30 Days', active: true },
    { days: 60, label: '60 Days', active: false },
    { days: 90, label: '90 Days', active: false },
  ]);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  
  const documentTypes = [
    { id: 'all', label: 'All Documents' },
    { id: 'license', label: 'Driver License' },
    { id: 'medical', label: 'Medical Card' },
    { id: 'ifta', label: 'IFTA' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'dot_card', label: 'DOT Card' },
  ];

  const fetchExpiringDocuments = async () => {
    setIsLoading(true);
    try {
      // Find active expiration filter
      const activeFilter = expirationFilters.find(filter => filter.active);
      const daysToExpiry = activeFilter ? activeFilter.days : 30;
      
      // Construct API endpoint with filters
      let endpoint = `/api/documents/expiring/${daysToExpiry}`;
      if (documentTypeFilter !== 'all') {
        endpoint += `?type=${documentTypeFilter}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expiring documents');
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching expiring documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpiringDocuments();
    }
  }, [token, expirationFilters, documentTypeFilter]);

  const toggleExpirationFilter = (days: number) => {
    setExpirationFilters(prevFilters => 
      prevFilters.map(filter => ({
        ...filter,
        active: filter.days === days
      }))
    );
  };

  const getDocumentStatus = (expiryDate: Date): DocumentStatus => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    if (isBefore(expiryDate, today)) {
      return 'expired';
    } else if (isBefore(expiryDate, thirtyDaysFromNow)) {
      return 'expiringSoon';
    } else {
      return 'valid';
    }
  };

  const getStatusBadgeClass = (status: DocumentStatus): string => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiringSoon':
        return 'bg-yellow-100 text-yellow-800';
      case 'valid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendExpirationReminder = async (documentId: string) => {
    try {
      const response = await fetch(`/api/notifications/send-reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      alert('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  const acknowledgeNotification = async (documentId: string) => {
    try {
      const response = await fetch(`/api/notifications/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge notification');
      }

      // Refresh the documents list
      fetchExpiringDocuments();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Document Expiration Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Monitor driver document expirations and send reminders to ensure compliance
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by driver, document type, or number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          {expirationFilters.map(filter => (
            <button
              key={filter.days}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => toggleExpirationFilter(filter.days)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={documentTypeFilter}
          onChange={(e) => setDocumentTypeFilter(e.target.value)}
        >
          {documentTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loader"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No expiring documents found with your current filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => {
                const status = getDocumentStatus(document.expiryDate);
                return (
                  <tr key={document.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{document.driverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {document.title}
                      </div>
                      <div className="text-xs text-gray-500">{document.documentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{document.documentNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {document.expiryDate ? format(new Date(document.expiryDate), 'MM/dd/yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                        {status === 'valid' ? 'Valid' : status === 'expiringSoon' ? 'Expiring Soon' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(document.imageUri, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => sendExpirationReminder(document.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Send Reminder
                        </button>
                        <button
                          onClick={() => acknowledgeNotification(document.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentExpirationDashboard;