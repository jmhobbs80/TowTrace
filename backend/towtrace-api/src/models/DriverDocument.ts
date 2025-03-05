import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Env } from '../types';

// Document types that require expiration dates
export const EXPIRY_REQUIRED_DOCUMENTS = [
  'license',      // Driver's License
  'medical',      // Health card
  'ifta',         // IFTA license
  'insurance',    // Truck insurance
  'dot_card'      // DOT card
];

// Define the document type schema
export const DocumentTypeSchema = z.enum([
  'license',      // Driver's License
  'medical',      // Health/Medical Card
  'ifta',         // IFTA License
  'insurance',    // Insurance Card
  'vehicle_reg',  // Vehicle Registration
  'eld_manual',   // ELD Manual
  'dot_card',     // DOT Card
  'company_id',   // Company ID
  'other'         // Other Document
]);

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

// Define the driver document schema
export const DriverDocumentSchema = z.object({
  id: z.string().default(() => uuidv4()),
  driver_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  document_type: DocumentTypeSchema,
  title: z.string(),
  document_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  requires_expiry: z.boolean().default(false),
  image_uri: z.string().optional(),
  sync_status: z.enum(['synced', 'pending', 'failed']).default('pending'),
  last_updated: z.string().datetime().default(() => new Date().toISOString()),
  created_at: z.string().datetime().default(() => new Date().toISOString()),
  updated_at: z.string().datetime().default(() => new Date().toISOString()),
});

export type DriverDocument = z.infer<typeof DriverDocumentSchema>;

// Define the notification type schema
export const NotificationTypeSchema = z.enum(['30day', '60day', '90day']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// Define the notification status schema
export const NotificationStatusSchema = z.enum(['pending', 'sent', 'acknowledged']);
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

// Define the document expiration notification schema
export const DocumentExpirationNotificationSchema = z.object({
  id: z.string().default(() => uuidv4()),
  document_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  notification_type: NotificationTypeSchema,
  notification_status: NotificationStatusSchema.default('pending'),
  sent_at: z.string().datetime().optional(),
  acknowledged_at: z.string().datetime().optional(),
  created_at: z.string().datetime().default(() => new Date().toISOString()),
  updated_at: z.string().datetime().default(() => new Date().toISOString()),
});

export type DocumentExpirationNotification = z.infer<typeof DocumentExpirationNotificationSchema>;

/**
 * Create a new driver document in the database
 * @param env - Environment variables including database connection
 * @param document - The document data to create
 * @returns The created document
 */
export async function createDriverDocument(
  env: Env, 
  document: Omit<DriverDocument, 'id' | 'created_at' | 'updated_at'>
): Promise<DriverDocument> {
  const newDocument = DriverDocumentSchema.parse({
    ...document,
    // Set requires_expiry based on document type
    requires_expiry: EXPIRY_REQUIRED_DOCUMENTS.includes(document.document_type),
  });

  // Insert the document into the database
  await env.DB.prepare(`
    INSERT INTO driver_documents (
      id, driver_id, tenant_id, document_type, title, document_number, 
      expiry_date, requires_expiry, image_uri, sync_status, last_updated
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    newDocument.id,
    newDocument.driver_id,
    newDocument.tenant_id,
    newDocument.document_type,
    newDocument.title,
    newDocument.document_number || null,
    newDocument.expiry_date || null,
    newDocument.requires_expiry ? 1 : 0,
    newDocument.image_uri || null,
    newDocument.sync_status,
    newDocument.last_updated
  ).run();

  // If document has an expiry date, create notification records
  if (newDocument.requires_expiry && newDocument.expiry_date) {
    await createExpiryNotifications(env, newDocument);
  }

  return newDocument;
}

/**
 * Update an existing driver document
 * @param env - Environment variables including database connection
 * @param id - The document ID to update
 * @param document - The document data to update
 * @returns The updated document
 */
export async function updateDriverDocument(
  env: Env,
  id: string,
  document: Partial<DriverDocument>
): Promise<DriverDocument | null> {
  // Get the current document
  const existingDoc = await getDriverDocumentById(env, id);
  if (!existingDoc) {
    return null;
  }

  // Update values
  const updatedDoc: DriverDocument = {
    ...existingDoc,
    ...document,
    updated_at: new Date().toISOString()
  };

  // Create SET clauses for SQL
  const setValues: string[] = [];
  const values: any[] = [];

  // Add fields that can be updated
  if (document.document_type !== undefined) {
    setValues.push('document_type = ?');
    values.push(document.document_type);
    
    // Update requires_expiry if document type changes
    const requiresExpiry = EXPIRY_REQUIRED_DOCUMENTS.includes(document.document_type);
    updatedDoc.requires_expiry = requiresExpiry;
    setValues.push('requires_expiry = ?');
    values.push(requiresExpiry ? 1 : 0);
  }
  
  if (document.title !== undefined) {
    setValues.push('title = ?');
    values.push(document.title);
  }
  
  if (document.document_number !== undefined) {
    setValues.push('document_number = ?');
    values.push(document.document_number || null);
  }
  
  if (document.expiry_date !== undefined) {
    setValues.push('expiry_date = ?');
    values.push(document.expiry_date || null);
    
    // If expiry date changed, update notifications
    if (document.expiry_date !== existingDoc.expiry_date) {
      // Delete existing notifications
      await env.DB.prepare(`
        DELETE FROM document_expiration_notifications
        WHERE document_id = ?
      `).bind(id).run();
      
      // Create new notifications if expiry date is set
      if (document.expiry_date && updatedDoc.requires_expiry) {
        await createExpiryNotifications(env, updatedDoc);
      }
    }
  }
  
  if (document.image_uri !== undefined) {
    setValues.push('image_uri = ?');
    values.push(document.image_uri || null);
  }
  
  if (document.sync_status !== undefined) {
    setValues.push('sync_status = ?');
    values.push(document.sync_status);
  }
  
  // Always update last_updated timestamp
  setValues.push('last_updated = ?');
  values.push(updatedDoc.updated_at);
  
  setValues.push('updated_at = ?');
  values.push(updatedDoc.updated_at);
  
  // If there's nothing to update, return the existing document
  if (setValues.length === 0) {
    return existingDoc;
  }
  
  // Add document ID to values for WHERE clause
  values.push(id);
  
  // Execute update query
  await env.DB.prepare(`
    UPDATE driver_documents
    SET ${setValues.join(', ')}
    WHERE id = ?
  `).bind(...values).run();
  
  return updatedDoc;
}

/**
 * Delete a driver document and its notifications
 * @param env - Environment variables including database connection
 * @param id - The document ID to delete
 * @returns True if document was deleted, false if not found
 */
export async function deleteDriverDocument(
  env: Env,
  id: string
): Promise<boolean> {
  // First delete any associated notifications
  await env.DB.prepare(`
    DELETE FROM document_expiration_notifications
    WHERE document_id = ?
  `).bind(id).run();
  
  // Then delete the document
  const result = await env.DB.prepare(`
    DELETE FROM driver_documents
    WHERE id = ?
  `).bind(id).run();
  
  return result.success && result.changes > 0;
}

/**
 * Get a driver document by ID
 * @param env - Environment variables including database connection
 * @param id - The document ID to retrieve
 * @returns The document or null if not found
 */
export async function getDriverDocumentById(
  env: Env,
  id: string
): Promise<DriverDocument | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM driver_documents WHERE id = ?
  `).bind(id).first();
  
  if (!result) {
    return null;
  }
  
  // Convert requires_expiry from 1/0 to true/false
  return {
    ...result,
    requires_expiry: result.requires_expiry === 1
  } as DriverDocument;
}

/**
 * Get all documents for a driver
 * @param env - Environment variables including database connection
 * @param driverId - The driver ID to retrieve documents for
 * @returns Array of driver documents
 */
export async function getDriverDocuments(
  env: Env,
  driverId: string,
  tenantId: string
): Promise<DriverDocument[]> {
  const results = await env.DB.prepare(`
    SELECT * FROM driver_documents 
    WHERE driver_id = ? AND tenant_id = ?
    ORDER BY created_at DESC
  `).bind(driverId, tenantId).all();
  
  if (!results.results) {
    return [];
  }
  
  // Convert requires_expiry from 1/0 to true/false for all documents
  return results.results.map(doc => ({
    ...doc,
    requires_expiry: doc.requires_expiry === 1
  })) as DriverDocument[];
}

/**
 * Get all documents expiring in a specific number of days
 * @param env - Environment variables including database connection
 * @param days - Number of days until expiration (30, 60, or 90)
 * @returns Array of documents expiring in specified days
 */
export async function getDocumentsExpiringInDays(
  env: Env,
  days: 30 | 60 | 90,
  tenantId?: string
): Promise<DriverDocument[]> {
  // Calculate the target date (today + days)
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + days);
  
  // Format dates for SQL comparison - YYYY-MM-DD
  const targetDateString = targetDate.toISOString().split('T')[0];
  const todayString = today.toISOString().split('T')[0];
  
  // Build the query
  let query = `
    SELECT d.* FROM driver_documents d
    WHERE d.requires_expiry = 1
    AND date(d.expiry_date) BETWEEN date(?) AND date(?)
  `;
  
  const params = [todayString, targetDateString];
  
  // Add tenant filter if provided
  if (tenantId) {
    query += ' AND d.tenant_id = ?';
    params.push(tenantId);
  }
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  if (!results.results) {
    return [];
  }
  
  // Convert requires_expiry from 1/0 to true/false for all documents
  return results.results.map(doc => ({
    ...doc,
    requires_expiry: doc.requires_expiry === 1
  })) as DriverDocument[];
}

/**
 * Create expiration notifications for a document
 * @param env - Environment variables including database connection
 * @param document - The document to create notifications for
 */
async function createExpiryNotifications(
  env: Env,
  document: DriverDocument
): Promise<void> {
  if (!document.expiry_date) {
    return;
  }
  
  // Create notifications for 30, 60, and 90 days before expiry
  const notificationTypes: NotificationType[] = ['30day', '60day', '90day'];
  
  for (const notificationType of notificationTypes) {
    const notification = DocumentExpirationNotificationSchema.parse({
      document_id: document.id,
      driver_id: document.driver_id,
      tenant_id: document.tenant_id,
      notification_type: notificationType,
      notification_status: 'pending'
    });
    
    await env.DB.prepare(`
      INSERT INTO document_expiration_notifications (
        id, document_id, driver_id, tenant_id, notification_type,
        notification_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      notification.id,
      notification.document_id,
      notification.driver_id,
      notification.tenant_id,
      notification.notification_type,
      notification.notification_status
    ).run();
  }
}

/**
 * Get all pending notifications for expiring documents
 * @param env - Environment variables including database connection
 * @param notificationType - Notification period (30, 60, or 90 days)
 * @returns Array of pending notifications
 */
export async function getPendingExpiryNotifications(
  env: Env,
  notificationType: NotificationType,
  tenantId?: string
): Promise<Array<DocumentExpirationNotification & { document: DriverDocument }>> {
  // Calculate the date threshold based on notification type
  const today = new Date();
  const expiryThreshold = new Date(today);
  
  if (notificationType === '30day') {
    expiryThreshold.setDate(today.getDate() + 30);
  } else if (notificationType === '60day') {
    expiryThreshold.setDate(today.getDate() + 60);
  } else if (notificationType === '90day') {
    expiryThreshold.setDate(today.getDate() + 90);
  }
  
  // Format date for SQL comparison
  const thresholdDateString = expiryThreshold.toISOString().split('T')[0];
  const todayString = today.toISOString().split('T')[0];
  
  // Build the query with JOIN to get document details
  let query = `
    SELECT n.*, d.*
    FROM document_expiration_notifications n
    JOIN driver_documents d ON n.document_id = d.id
    WHERE n.notification_type = ?
    AND n.notification_status = 'pending'
    AND date(d.expiry_date) BETWEEN date(?) AND date(?)
  `;
  
  const params = [notificationType, todayString, thresholdDateString];
  
  // Add tenant filter if provided
  if (tenantId) {
    query += ' AND n.tenant_id = ?';
    params.push(tenantId);
  }
  
  const results = await env.DB.prepare(query).bind(...params).all();
  
  if (!results.results || results.results.length === 0) {
    return [];
  }
  
  // Process results to separate notification and document data
  return results.results.map(row => {
    // Extract document fields
    const document: DriverDocument = {
      id: row.document_id,
      driver_id: row.driver_id,
      tenant_id: row.tenant_id,
      document_type: row.document_type,
      title: row.title,
      document_number: row.document_number,
      expiry_date: row.expiry_date,
      requires_expiry: row.requires_expiry === 1,
      image_uri: row.image_uri,
      sync_status: row.sync_status,
      last_updated: row.last_updated,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    // Extract notification fields
    const notification: DocumentExpirationNotification = {
      id: row.id,
      document_id: row.document_id,
      driver_id: row.driver_id,
      tenant_id: row.tenant_id,
      notification_type: row.notification_type,
      notification_status: row.notification_status,
      sent_at: row.sent_at,
      acknowledged_at: row.acknowledged_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    // Return combined object
    return {
      ...notification,
      document
    };
  });
}

/**
 * Mark a notification as sent
 * @param env - Environment variables including database connection
 * @param notificationId - The notification ID to update
 * @returns Boolean indicating if the update was successful
 */
export async function markNotificationSent(
  env: Env,
  notificationId: string
): Promise<boolean> {
  const now = new Date().toISOString();
  
  const result = await env.DB.prepare(`
    UPDATE document_expiration_notifications
    SET notification_status = 'sent', sent_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(now, now, notificationId).run();
  
  return result.success && result.changes > 0;
}

/**
 * Mark a notification as acknowledged
 * @param env - Environment variables including database connection
 * @param notificationId - The notification ID to update
 * @returns Boolean indicating if the update was successful
 */
export async function markNotificationAcknowledged(
  env: Env,
  notificationId: string
): Promise<boolean> {
  const now = new Date().toISOString();
  
  const result = await env.DB.prepare(`
    UPDATE document_expiration_notifications
    SET notification_status = 'acknowledged', acknowledged_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(now, now, notificationId).run();
  
  return result.success && result.changes > 0;
}