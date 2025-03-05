'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserAccountMenuProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  userRole = 'admin',
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatar,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

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

  const handleLogout = () => {
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
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
        className="flex items-center rounded-md text-sm focus:outline-none transition duration-150 ease-in-out hover:bg-gray-100 p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <div className="flex flex-shrink-0 items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-800">{userName}</span>
            <span className="text-xs text-gray-500">{userRole}</span>
          </div>
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-200 transform opacity-100 scale-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">{userName}</p>
            <p className="text-xs font-normal text-gray-500 truncate">{userEmail}</p>
          </div>
          <div className="py-1">
            <button
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleNavigate('/dashboard/profile')}
              role="menuitem"
            >
              Your Profile
            </button>
            <button
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleNavigate('/dashboard/settings')}
              role="menuitem"
            >
              Settings
            </button>
            {userRole === 'admin' && (
              <button
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleNavigate('/dashboard/settings/users')}
                role="menuitem"
              >
                User Management
              </button>
            )}
          </div>
          <div className="py-1 border-t border-gray-100">
            <button
              className="text-red-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={handleLogout}
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountMenu;