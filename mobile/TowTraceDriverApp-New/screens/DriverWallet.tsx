import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = 'https://towtrace-api.justin-michael-hobbs.workers.dev';

interface DocumentItem {
  id: string;
  type: string;
  title: string;
  expiryDate?: string;
  documentNumber?: string;
  imageUri?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastUpdated: string;
}

// Document types that can be added to the driver wallet
const DOCUMENT_TYPES = [
  { id: 'license', title: 'Driver\'s License', required: true },
  { id: 'medical', title: 'Medical Card', required: true },
  { id: 'ifta', title: 'IFTA License', required: false },
  { id: 'insurance', title: 'Insurance Card', required: true },
  { id: 'vehicle_reg', title: 'Vehicle Registration', required: true },
  { id: 'eld_manual', title: 'ELD Manual', required: false },
  { id: 'dot_card', title: 'DOT Card', required: true },
  { id: 'company_id', title: 'Company ID', required: false },
  { id: 'other', title: 'Other Document', required: false },
];

const DriverWallet: React.FC = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingUploads, setPendingUploads] = useState<DocumentItem[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  useEffect(() => {
    // Check network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Try to sync pending documents when connectivity returns
      if (state.isConnected && pendingUploads.length > 0) {
        syncPendingDocuments();
      }
    });

    // Load documents from storage
    loadDocuments();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      // First try to get docs from server
      if (isConnected) {
        try {
          const response = await axios.get(`${API_BASE_URL}/driver-docs`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data && response.data.documents) {
            // Save to local storage
            await AsyncStorage.setItem('driverDocuments', JSON.stringify(response.data.documents));
            setDocuments(response.data.documents);
            
            // Check for pending uploads
            const pendingDocs = response.data.documents.filter(
              (doc: DocumentItem) => doc.syncStatus === 'pending' || doc.syncStatus === 'failed'
            );
            setPendingUploads(pendingDocs);
          }
        } catch (error) {
          console.error('Error fetching documents from server:', error);
          // Fall back to local storage
          await loadFromLocalStorage();
        }
      } else {
        // Load from local storage if offline
        await loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Unable to load documents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const storedDocuments = await AsyncStorage.getItem('driverDocuments');
      if (storedDocuments) {
        const parsedDocs = JSON.parse(storedDocuments) as DocumentItem[];
        setDocuments(parsedDocs);
        
        // Check for pending uploads
        const pendingDocs = parsedDocs.filter(
          doc => doc.syncStatus === 'pending' || doc.syncStatus === 'failed'
        );
        setPendingUploads(pendingDocs);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const syncPendingDocuments = async () => {
    if (pendingUploads.length === 0 || !isConnected) return;
    
    setIsSyncing(true);
    try {
      // Process one document at a time to avoid timeout issues
      for (const doc of pendingUploads) {
        try {
          await axios.post(
            `${API_BASE_URL}/driver-docs/upload`,
            {
              document: doc
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Update document status to synced
          const updatedDocuments = documents.map(d => 
            d.id === doc.id ? { ...d, syncStatus: 'synced' } : d
          );
          
          // Save updated documents
          setDocuments(updatedDocuments);
          await AsyncStorage.setItem('driverDocuments', JSON.stringify(updatedDocuments));
          
        } catch (error) {
          console.error(`Error syncing document ${doc.id}:`, error);
          // Mark document as failed sync
          const updatedDocuments = documents.map(d => 
            d.id === doc.id ? { ...d, syncStatus: 'failed' } : d
          );
          
          setDocuments(updatedDocuments);
          await AsyncStorage.setItem('driverDocuments', JSON.stringify(updatedDocuments));
        }
      }
      
      // Refresh pending uploads list
      const remainingPending = documents.filter(
        doc => doc.syncStatus === 'pending' || doc.syncStatus === 'failed'
      );
      setPendingUploads(remainingPending);
      
      if (remainingPending.length === 0) {
        Alert.alert('Sync Complete', 'All documents have been successfully synced.');
      } else {
        Alert.alert('Sync Incomplete', 'Some documents could not be synced. Please try again later.');
      }
    } catch (error) {
      console.error('Error during sync process:', error);
      Alert.alert('Sync Error', 'There was a problem syncing your documents. Please try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddDocument = () => {
    // Show document type selection
    Alert.alert(
      'Select Document Type',
      'Choose the type of document to add:',
      DOCUMENT_TYPES.map(type => ({
        text: type.title,
        onPress: () => setSelectedDocType(type.id)
      })),
      { cancelable: true }
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "TowTrace needs access to your camera to take document photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS handles permissions via the image picker
    }
  };

  const captureImage = async () => {
    if (!selectedDocType) return;
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to capture document images.');
      return;
    }
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    try {
      const result = await launchCamera(options);
      
      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      
      if (result.errorCode) {
        console.log('Camera Error: ', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Error capturing image');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0];
        
        // Create new document
        const docType = DOCUMENT_TYPES.find(type => type.id === selectedDocType);
        
        const newDocument: DocumentItem = {
          id: Date.now().toString(),
          type: selectedDocType,
          title: docType?.title || 'Document',
          imageUri: capturedImage.uri,
          syncStatus: isConnected ? 'pending' : 'failed',
          lastUpdated: new Date().toISOString(),
        };
        
        // Add to documents list
        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        
        // Save to local storage
        await AsyncStorage.setItem('driverDocuments', JSON.stringify(updatedDocuments));
        
        // Add to pending uploads if online
        if (isConnected) {
          setPendingUploads([...pendingUploads, newDocument]);
          
          // Try to sync immediately
          try {
            await axios.post(
              `${API_BASE_URL}/driver-docs/upload`,
              {
                document: newDocument
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Update document status to synced
            const syncedDocuments = updatedDocuments.map(d => 
              d.id === newDocument.id ? { ...d, syncStatus: 'synced' } : d
            );
            
            setDocuments(syncedDocuments);
            await AsyncStorage.setItem('driverDocuments', JSON.stringify(syncedDocuments));
            
            // Update pending uploads
            setPendingUploads(pendingUploads.filter(doc => doc.id !== newDocument.id));
            
          } catch (error) {
            console.error('Error uploading document:', error);
            // Document will remain in pending uploads for later sync
          }
        } else {
          setPendingUploads([...pendingUploads, newDocument]);
        }
        
        // Reset selected doc type
        setSelectedDocType(null);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const selectFromGallery = async () => {
    if (!selectedDocType) return;
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('User cancelled image selection');
        return;
      }
      
      if (result.errorCode) {
        console.log('Image Library Error: ', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Error selecting image');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Create new document
        const docType = DOCUMENT_TYPES.find(type => type.id === selectedDocType);
        
        const newDocument: DocumentItem = {
          id: Date.now().toString(),
          type: selectedDocType,
          title: docType?.title || 'Document',
          imageUri: selectedImage.uri,
          syncStatus: isConnected ? 'pending' : 'failed',
          lastUpdated: new Date().toISOString(),
        };
        
        // Add to documents list
        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        
        // Save to local storage
        await AsyncStorage.setItem('driverDocuments', JSON.stringify(updatedDocuments));
        
        // Add to pending uploads
        setPendingUploads([...pendingUploads, newDocument]);
        
        // Try to sync immediately if online
        if (isConnected) {
          try {
            await axios.post(
              `${API_BASE_URL}/driver-docs/upload`,
              {
                document: newDocument
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Update document status to synced
            const syncedDocuments = updatedDocuments.map(d => 
              d.id === newDocument.id ? { ...d, syncStatus: 'synced' } : d
            );
            
            setDocuments(syncedDocuments);
            await AsyncStorage.setItem('driverDocuments', JSON.stringify(syncedDocuments));
            
            // Update pending uploads
            setPendingUploads(pendingUploads.filter(doc => doc.id !== newDocument.id));
          } catch (error) {
            console.error('Error uploading document:', error);
            // Document will remain in pending uploads for later sync
          }
        }
        
        // Reset selected doc type
        setSelectedDocType(null);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleImageSelection = () => {
    if (!selectedDocType) return;
    
    Alert.alert(
      'Add Document Image',
      'Choose image source:',
      [
        {
          text: 'Camera',
          onPress: captureImage
        },
        {
          text: 'Gallery',
          onPress: selectFromGallery
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedDocType(null)
        }
      ]
    );
  };

  useEffect(() => {
    // When a document type is selected, show options for adding image
    if (selectedDocType) {
      handleImageSelection();
    }
  }, [selectedDocType]);

  const handleDeleteDocument = (docId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from documents list
              const updatedDocuments = documents.filter(doc => doc.id !== docId);
              setDocuments(updatedDocuments);
              
              // Save to local storage
              await AsyncStorage.setItem('driverDocuments', JSON.stringify(updatedDocuments));
              
              // Update pending uploads
              setPendingUploads(pendingUploads.filter(doc => doc.id !== docId));
              
              // Delete from server if online
              if (isConnected) {
                try {
                  await axios.delete(`${API_BASE_URL}/driver-docs/${docId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                } catch (error) {
                  console.error('Error deleting document from server:', error);
                  // Document is already deleted locally, so no further action needed
                }
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleViewDocument = (document: DocumentItem) => {
    // Implementation for viewing a document in full screen
    // This could use a modal or navigate to a detail screen
    Alert.alert(
      document.title,
      `Type: ${document.type}\nLast Updated: ${new Date(document.lastUpdated).toLocaleString()}\nSync Status: ${document.syncStatus}`,
      [
        {
          text: 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  const renderDocumentItem = (document: DocumentItem) => {
    return (
      <TouchableOpacity
        key={document.id}
        style={styles.documentItem}
        onPress={() => handleViewDocument(document)}
      >
        <View style={styles.documentImageContainer}>
          {document.imageUri ? (
            <Image 
              source={{ uri: document.imageUri }} 
              style={styles.documentImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.documentPlaceholder}>
              <Text style={styles.documentPlaceholderText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <Text style={styles.documentDate}>
            Updated: {new Date(document.lastUpdated).toLocaleDateString()}
          </Text>
          <View style={[
            styles.syncStatusBadge, 
            document.syncStatus === 'synced' 
              ? styles.syncedBadge 
              : document.syncStatus === 'pending' 
                ? styles.pendingBadge 
                : styles.failedBadge
          ]}>
            <Text style={styles.syncStatusText}>
              {document.syncStatus === 'synced' 
                ? 'Synced' 
                : document.syncStatus === 'pending' 
                  ? 'Pending' 
                  : 'Failed'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDocument(document.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderRequiredDocuments = () => {
    const requiredTypes = DOCUMENT_TYPES.filter(type => type.required).map(type => type.id);
    const requiredDocs = documents.filter(doc => requiredTypes.includes(doc.type));
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        {requiredDocs.length > 0 ? (
          requiredDocs.map(renderDocumentItem)
        ) : (
          <Text style={styles.emptyText}>No required documents added yet</Text>
        )}
      </View>
    );
  };

  const renderOptionalDocuments = () => {
    const optionalTypes = DOCUMENT_TYPES.filter(type => !type.required).map(type => type.id);
    const optionalDocs = documents.filter(doc => optionalTypes.includes(doc.type));
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Optional Documents</Text>
        {optionalDocs.length > 0 ? (
          optionalDocs.map(renderDocumentItem)
        ) : (
          <Text style={styles.emptyText}>No optional documents added yet</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.title}>Driver Wallet</Text>
        
        {!isConnected && (
          <View style={styles.offlineMessage}>
            <Text style={styles.offlineText}>
              You are currently offline. Documents will be saved locally and uploaded when connection is restored.
            </Text>
          </View>
        )}
        
        {pendingUploads.length > 0 && isConnected && (
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={syncPendingDocuments}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <View style={styles.syncingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.syncButtonText}>Syncing...</Text>
              </View>
            ) : (
              <Text style={styles.syncButtonText}>
                Sync {pendingUploads.length} Pending Document{pendingUploads.length !== 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {renderRequiredDocuments()}
        {renderOptionalDocuments()}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddDocument}
        >
          <Text style={styles.addButtonText}>+ Add Document</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  offlineMessage: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  offlineText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000000',
  },
  emptyText: {
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  documentItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentImageContainer: {
    width: 80,
    height: 80,
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  documentPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentPlaceholderText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  documentInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  syncStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  syncedBadge: {
    backgroundColor: '#34C759',
  },
  pendingBadge: {
    backgroundColor: '#FF9500',
  },
  failedBadge: {
    backgroundColor: '#FF3B30',
  },
  syncStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DriverWallet;