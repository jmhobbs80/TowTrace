'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export interface Notification {
  id: string;
  type: 'document_expiry' | 'system' | 'driver_arrival' | 'job_update';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  documentId?: string;
  driverId?: string;
  jobId?: string;
  actionUrl?: string;
}

interface NotificationMenuProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onFetchNotifications: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  notifications = [],
  onMarkAllAsRead,
  onMarkAsRead,
  onFetchNotifications,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    // Add click outside handler to close menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Load notifications when component mounts
    onFetchNotifications();
  }, [onFetchNotifications]);

  const handleMenuMouseEnter = () => {
    // Clear any pending close timeout
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    
    // Open menu
    setIsMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    // Set timeout to close menu after a delay
    menuTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 300);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      setIsMenuOpen(false);
      router.push(notification.actionUrl);
    } else if (notification.type === 'document_expiry' && notification.documentId) {
      setIsMenuOpen(false);
      router.push(`/dashboard/documents?documentId=${notification.documentId}`);
    } else if (notification.type === 'driver_arrival' && notification.driverId) {
      setIsMenuOpen(false);
      router.push(`/dashboard/drivers/${notification.driverId}`);
    } else if (notification.type === 'job_update' && notification.jobId) {
      setIsMenuOpen(false);
      router.push(`/dashboard/jobs?jobId=${notification.jobId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_expiry':
        return (
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
        );
      case 'driver_arrival':
        return (
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        );
      case 'job_update':
        return (
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className="relative z-50"
      ref={menuRef}
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
    >
      <button
        type="button"
        className="relative p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
          onFetchNotifications();
        }}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-200 transform opacity-100 scale-100"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-primary-600 hover:text-primary-800" 
                onClick={onMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer flex items-start ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto mb-2 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 text-center">
            <Link 
              href="/dashboard/settings?tab=notifications" 
              className="text-xs text-primary-600 hover:text-primary-800 block"
              onClick={() => setIsMenuOpen(false)}
            >
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;