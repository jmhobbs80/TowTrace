/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Output standalone build for improved performance and deployment options
  output: 'standalone',
  
  // Custom headers for improved security
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Image configuration for optimization
  images: {
    domains: ['i.pravatar.cc'], // Allow avatar images from pravatar
    formats: ['image/avif', 'image/webp']
  },
  
  // Environment variables accessible in the browser
  // For sensitive variables, use .env.local which is not committed to the repo
  env: {
    NEXT_PUBLIC_API_URL: 'https://towtrace-api.justin-michael-hobbs.workers.dev',
    NEXT_PUBLIC_SITE_URL: 'https://www.towtrace.com',
  },
  
  // Redirects for cleaner URLs
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard',
        permanent: true,
      }
    ];
  },
  
  // Set trailing slash to false for cleaner URLs
  trailingSlash: false,
  
  // Compiler options
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // For production environments, enable React production optimizations
  // Additional optimizations for production build
  swcMinify: true,
  
  // Disable the x-powered-by header for security
  poweredByHeader: false,
};

module.exports = nextConfig;