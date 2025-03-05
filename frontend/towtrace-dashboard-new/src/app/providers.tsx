'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/auth-context';
import { NotificationProvider } from './context/notification-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}