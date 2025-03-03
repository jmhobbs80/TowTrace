/** @type {import('next').NextConfig} */

/**
 * TowTrace Dashboard Next.js configuration
 * - Sets up security headers including Content-Security-Policy
 * - Configures environment variables handling
 */
const nextConfig = {
  // Server configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Security headers configuration
  async headers() {
    // Skip CSP in development mode
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://api.mapbox.com https://*.tiles.mapbox.com blob:;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://towtrace-api.justin-michael-hobbs.workers.dev https://api.mapbox.com;
              frame-src 'self' https://accounts.google.com https://api.quickbooks.com;
              worker-src 'self' blob:;
            `.replace(/\s+/g, ' ').trim(),
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // Force HTTPS and handle domain redirects (only in production)
  async redirects() {
    // Skip redirects in development mode
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.towtrace.com/:1',
        permanent: true,
      },
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'towtrace.com', // Redirect non-www to www
          },
        ],
        destination: 'https://www.towtrace.com/:1',
        permanent: true,
      },
    ];
  },
  
  // Image optimization configuration
  images: {
    domains: ['towtrace-api.justin-michael-hobbs.workers.dev'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
