import { Env, TokenPayload } from '../types';
import { Hono } from 'hono';
import { getPendingExpiryNotifications, markNotificationSent, NotificationType } from '../models/DriverDocument';

// Create a Hono router for the notifications endpoints
const notificationsRouter = new Hono<{ Bindings: Env, Variables: { tokenPayload: TokenPayload } }>();

/**
 * Get all pending document expiration notifications
 * This endpoint is for system use (e.g., notifications worker)
 */
notificationsRouter.get('/document-expiry/:type', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    const notificationType = c.req.param('type') as NotificationType;
    
    // Only system_admin can access this endpoint
    if (tokenPayload.role !== 'system_admin') {
      return c.json({ error: 'Forbidden', message: 'Only system admins can access this endpoint' }, 403);
    }
    
    // Validate notification type
    if (!['30day', '60day', '90day'].includes(notificationType)) {
      return c.json({ error: 'Bad Request', message: 'Invalid notification type' }, 400);
    }
    
    // Get pending notifications
    const notifications = await getPendingExpiryNotifications(c.env, notificationType);
    
    return c.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch notifications' }, 500);
  }
});

/**
 * Get pending notifications for a specific tenant
 * For tenant admins to view pending notifications
 */
notificationsRouter.get('/tenant/document-expiry/:type', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    const notificationType = c.req.param('type') as NotificationType;
    
    // Only admin, dispatcher, manager, or client_admin can access this endpoint
    if (!['admin', 'dispatcher', 'manager', 'client_admin'].includes(tokenPayload.role)) {
      return c.json({ error: 'Forbidden', message: 'Only admin and dispatcher users can access this endpoint' }, 403);
    }
    
    // Validate notification type
    if (!['30day', '60day', '90day'].includes(notificationType)) {
      return c.json({ error: 'Bad Request', message: 'Invalid notification type' }, 400);
    }
    
    // Get pending notifications for the tenant
    const notifications = await getPendingExpiryNotifications(c.env, notificationType, tokenPayload.tenantId);
    
    return c.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching tenant notifications:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to fetch tenant notifications' }, 500);
  }
});

/**
 * Mark a notification as sent
 * This endpoint is for system use (e.g., when email or push notification is sent)
 */
notificationsRouter.post('/mark-sent/:id', async (c) => {
  try {
    const tokenPayload = c.get('tokenPayload');
    const notificationId = c.req.param('id');
    
    // Only system_admin can access this endpoint
    if (tokenPayload.role !== 'system_admin') {
      return c.json({ error: 'Forbidden', message: 'Only system admins can access this endpoint' }, 403);
    }
    
    // Mark the notification as sent
    const success = await markNotificationSent(c.env, notificationId);
    
    if (!success) {
      return c.json({ error: 'Not Found', message: 'Notification not found or already sent' }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Notification marked as sent',
    });
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    return c.json({ error: 'Internal Server Error', message: 'Failed to mark notification as sent' }, 500);
  }
});

export default notificationsRouter;