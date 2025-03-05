'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '@/components/NotificationMenu';
import { useAuth } from './auth-context';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendDocumentReminder: (documentId: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token, isAuthenticated } = useAuth();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications from the API
  const loadNotifications = useCallback(async () => {
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [token, isAuthenticated]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token, isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [token, isAuthenticated]);

  // Send a document expiration reminder
  const sendDocumentReminder = useCallback(async (documentId: string) => {
    if (!token || !isAuthenticated) return false;

    try {
      const response = await fetch('/api/notifications/send-reminder', {
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

      return true;
    } catch (error) {
      console.error('Error sending document reminder:', error);
      return false;
    }
  }, [token, isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  // Set up polling for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      loadNotifications();
    }, 60000); // Poll every minute

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  const value = {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    sendDocumentReminder,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};