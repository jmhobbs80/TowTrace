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
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    driverId: '',
    documentType: 'license',
    title: '',
    documentNumber: '',
    expiryDate: '',
    description: '',
    file: null as File | null,
  });
  
  // State for driver options (would come from API in real implementation)
  const [driverOptions] = useState([
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' },
  ]);
  
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
  
  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };
  
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFormData.file) {
      alert('Please select a file to upload');
      return;
    }
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', uploadFormData.file);
      formData.append('driverId', uploadFormData.driverId);
      formData.append('documentType', uploadFormData.documentType);
      formData.append('title', uploadFormData.title);
      formData.append('documentNumber', uploadFormData.documentNumber);
      formData.append('expiryDate', uploadFormData.expiryDate);
      formData.append('description', uploadFormData.description);
      
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/documents/upload', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to upload document');
      // }
      
      // Simulate successful upload
      alert('Document uploaded successfully');
      
      // Reset form and close it
      setUploadFormData({
        driverId: '',
        documentType: 'license',
        title: '',
        documentNumber: '',
        expiryDate: '',
        description: '',
        file: null,
      });
      setShowUploadForm(false);
      
      // Refresh documents list
      fetchExpiringDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };
  
  const toggleCamera = () => {
    // In a real implementation, this would open the device camera
    alert('Camera functionality would be implemented here');
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Expiration Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor driver document expirations and send reminders to ensure compliance
          </p>
        </div>
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Document
        </button>
      </div>
      
      {showUploadForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Upload New Document</h2>
          <form onSubmit={handleUploadSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <select
                  id="driverId"
                  name="driverId"
                  value={uploadFormData.driverId}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a driver</option>
                  {driverOptions.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  value={uploadFormData.documentType}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {documentTypes.slice(1).map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadFormData.title}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Number
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  value={uploadFormData.documentNumber}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={uploadFormData.expiryDate}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadFormData.description}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document File
                </label>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 h-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                      Take Photo
                    </button>
                  </div>
                </div>
                {uploadFormData.file && (
                  <p className="mt-2 text-sm text-green-600">
                    File selected: {uploadFormData.file.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      )}

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