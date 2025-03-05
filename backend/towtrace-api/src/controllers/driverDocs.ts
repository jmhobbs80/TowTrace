import { Env, TokenPayload } from '../types';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  DriverDocumentSchema,
  createDriverDocument,
  updateDriverDocument,
  deleteDriverDocument,
  getDriverDocumentById,
  getDriverDocuments,
  getDocumentsExpiringInDays,
  markNotificationAcknowledged,
  DocumentTypeSchema
} from '../models/DriverDocument';
import { requireAuth, checkRole } from '../middlewares/auth';

// Create a Hono router for the driver documents endpoints
const driverDocsRouter = new Hono<{ Bindings: Env, Variables: { tokenPayload: TokenPayload } }>();

// Document creation schema for validation
const CreateDocumentSchema = z.object({
  document_type: DocumentTypeSchema,
  title: z.string(),
  document_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  image_uri: z.string().optional(),
});

// Document update schema for validation
const UpdateDocumentSchema = z.object({
  document_type: DocumentTypeSchema.optional(),
  title: z.string().optional(),
  document_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  image_uri: z.string().optional(),
});

/**
 * Get all documents for the authenticated driver
 */
driverDocsRouter.get('/', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    
    // Determine if the request is for the user's own documents (driver)
    // or if it's an admin/dispatcher looking at a specific driver's documents
    let driverId = tokenPayload.userId;
    let isOwnDocuments = true;
    
    // Check if a driver ID is specified in the query (for admins/dispatchers)
    const queryDriverId = c.req.query('driverId');
    
    if (queryDriverId && tokenPayload.role !== 'driver') {
      // Admins, dispatchers can view others' documents
      if (['admin', 'dispatcher', 'manager', 'system_admin', 'client_admin'].includes(tokenPayload.role)) {
        driverId = queryDriverId;
        isOwnDocuments = false;
      } else {
        return c.json({ error: 'Unauthorized', message: 'You do not have permission to view documents for other drivers' }, 403);
      }
    }
    
    // Get documents from the database
    const documents = await getDriverDocuments(c.env, driverId, tokenPayload.tenantId);
    
    return c.json({
      success: true,
      documents,
      isOwnDocuments,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch documents' }, 500);
  }
});

/**
 * Get a specific document by ID
 */
driverDocsRouter.get('/:id', async (c) => {
  try {
    const documentId = c.req.param('id');
    const tokenPayload = c.get('tokenPayload');
    
    // Get the document from the database
    const document = await getDriverDocumentById(c.env, documentId);
    
    if (!document) {
      return c.json({ error: 'Not Found', message: 'Document not found' }, 404);
    }
    
    // Check if the user has permission to view this document
    if (document.tenant_id !== tokenPayload.tenantId) {
      return c.json({ error: 'Forbidden', message: 'You do not have access to this document' }, 403);
    }
    
    // If user is not the document owner, check if they have admin/dispatcher role
    if (document.driver_id !== tokenPayload.userId && tokenPayload.role === 'driver') {
      return c.json({ error: 'Forbidden', message: 'You do not have permission to view this document' }, 403);
    }
    
    return c.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch document' }, 500);
  }
});

/**
 * Create a new document
 */
driverDocsRouter.post('/upload', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    const body = await c.req.json();
    
    // Determine the driver ID - either the requester's ID or a specified driver ID (for admins)
    let driverId = tokenPayload.userId;
    
    // If admin is uploading a document for a driver
    if (body.driverId && tokenPayload.role !== 'driver') {
      if (['admin', 'dispatcher', 'manager', 'system_admin', 'client_admin'].includes(tokenPayload.role)) {
        driverId = body.driverId;
      } else {
        return c.json({ error: 'Forbidden', message: 'You do not have permission to upload documents for other drivers' }, 403);
      }
    }
    
    // Validate the request data
    const validationResult = CreateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ error: 'Bad Request', message: validationResult.error.message }, 400);
    }
    
    // Create the document
    const documentData = validationResult.data;
    const document = await createDriverDocument(c.env, {
      ...documentData,
      driver_id: driverId,
      tenant_id: tokenPayload.tenantId,
      sync_status: 'synced', // When creating via API, mark as synced
    });
    
    return c.json({
      success: true,
      document,
    }, 201);
  } catch (error) {
    console.error('Error creating document:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to create document' }, 500);
  }
});

/**
 * Update an existing document
 */
driverDocsRouter.put('/:id', async (c) => {
  try {
    const documentId = c.req.param('id');
    const tokenPayload = c.get('tokenPayload');
    const body = await c.req.json();
    
    // Get the existing document
    const existingDocument = await getDriverDocumentById(c.env, documentId);
    if (!existingDocument) {
      return c.json({ error: 'Not Found', message: 'Document not found' }, 404);
    }
    
    // Check if the user has permission to update this document
    if (existingDocument.tenant_id !== tokenPayload.tenantId) {
      return c.json({ error: 'Forbidden', message: 'You do not have access to this document' }, 403);
    }
    
    // If user is not the document owner, check if they have admin/dispatcher role
    if (existingDocument.driver_id !== tokenPayload.userId && tokenPayload.role === 'driver') {
      return c.json({ error: 'Forbidden', message: 'You do not have permission to update this document' }, 403);
    }
    
    // Validate the request data
    const validationResult = UpdateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ error: 'Bad Request', message: validationResult.error.message }, 400);
    }
    
    // Update the document
    const documentData = validationResult.data;
    const updatedDocument = await updateDriverDocument(c.env, documentId, {
      ...documentData,
      sync_status: 'synced', // When updating via API, mark as synced
    });
    
    if (!updatedDocument) {
      return c.json({ error: 'Not Found', message: 'Document not found' }, 404);
    }
    
    return c.json({
      success: true,
      document: updatedDocument,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to update document' }, 500);
  }
});

/**
 * Delete a document
 */
driverDocsRouter.delete('/:id', async (c) => {
  try {
    const documentId = c.req.param('id');
    const tokenPayload = c.get('tokenPayload');
    
    // Get the existing document
    const existingDocument = await getDriverDocumentById(c.env, documentId);
    if (!existingDocument) {
      return c.json({ error: 'Not Found', message: 'Document not found' }, 404);
    }
    
    // Check if the user has permission to delete this document
    if (existingDocument.tenant_id !== tokenPayload.tenantId) {
      return c.json({ error: 'Forbidden', message: 'You do not have access to this document' }, 403);
    }
    
    // If user is not the document owner, check if they have admin/dispatcher role
    if (existingDocument.driver_id !== tokenPayload.userId && tokenPayload.role === 'driver') {
      return c.json({ error: 'Forbidden', message: 'You do not have permission to delete this document' }, 403);
    }
    
    // Delete the document
    const success = await deleteDriverDocument(c.env, documentId);
    
    if (!success) {
      return c.json({ error: 'Internal Server Error', message: 'Failed to delete document' }, 500);
    }
    
    return c.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to delete document' }, 500);
  }
});

/**
 * Get documents that are expiring soon
 * Admin/dispatcher only endpoint
 */
driverDocsRouter.get('/expiring/:days', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    const daysStr = c.req.param('days');
    
    // Check if the user has permission to view expiring documents
    if (!['admin', 'dispatcher', 'manager', 'system_admin', 'client_admin'].includes(tokenPayload.role)) {
      return c.json({ error: 'Forbidden', message: 'Only admin and dispatcher users can view expiring documents' }, 403);
    }
    
    // Parse and validate days parameter
    const days = parseInt(daysStr, 10);
    if (![30, 60, 90].includes(days)) {
      return c.json({ error: 'Bad Request', message: 'Days parameter must be 30, 60, or 90' }, 400);
    }
    
    // Get expiring documents for the tenant
    const documents = await getDocumentsExpiringInDays(c.env, days as 30 | 60 | 90, tokenPayload.tenantId);
    
    return c.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch expiring documents' }, 500);
  }
});

/**
 * Acknowledge a document notification
 */
driverDocsRouter.post('/notifications/:id/acknowledge', async (c) => {
  try {
    const notificationId = c.req.param('id');
    const tokenPayload = c.get('tokenPayload');
    
    // Only admins and dispatchers can acknowledge notifications
    if (!['admin', 'dispatcher', 'manager', 'system_admin', 'client_admin'].includes(tokenPayload.role)) {
      return c.json({ error: 'Forbidden', message: 'Only admin and dispatcher users can acknowledge notifications' }, 403);
    }
    
    // Mark the notification as acknowledged
    const success = await markNotificationAcknowledged(c.env, notificationId);
    
    if (!success) {
      return c.json({ error: 'Not Found', message: 'Notification not found or already acknowledged' }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Notification acknowledged successfully',
    });
  } catch (error) {
    console.error('Error acknowledging notification:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to acknowledge notification' }, 500);
  }
});

export default driverDocsRouter;