import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { DefaultSeo } from 'next-seo';
import { Providers } from './providers';

// Use Inter as a fallback since SF Pro is not available in next/font/google
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TowTrace - Vehicle Transport Management',
  description: 'TowTrace is a comprehensive transport management solution for towing and transport businesses, offering real-time GPS tracking, driver dispatch, fleet management, and more.',
  generator: 'Next.js',
  applicationName: 'TowTrace',
  referrer: 'origin-when-cross-origin',
  keywords: ['towing', 'vehicle transport', 'fleet management', 'gps tracking', 'vin scanning', 'dispatch'],
  authors: [{ name: 'TowTrace Team' }],
  creator: 'TowTrace',
  publisher: 'TowTrace',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.towtrace.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TowTrace - Vehicle Transport Management',
    description: 'Comprehensive transport management solution for towing and transport businesses',
    url: 'https://www.towtrace.com',
    siteName: 'TowTrace',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen`}
      >
        <DefaultSeo
          titleTemplate="%s | TowTrace"
          defaultTitle="TowTrace - Vehicle Transport Management"
          description="Comprehensive transport management solution for towing and transport businesses"
          canonical="https://www.towtrace.com"
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: 'https://www.towtrace.com',
            siteName: 'TowTrace',
            title: 'TowTrace - Vehicle Transport Management',
            description: 'Comprehensive transport management solution for towing and transport businesses',
            images: [
              {
                url: 'https://www.towtrace.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'TowTrace',
              },
            ],
          }}
          twitter={{
            handle: '@towtrace',
            site: '@towtrace',
            cardType: 'summary_large_image',
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}