import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './context/auth-context';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TowTrace Dashboard',
  description: 'Management system for vehicle towing and transport operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}