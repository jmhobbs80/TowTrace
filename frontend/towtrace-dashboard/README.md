# TowTrace Dashboard

A comprehensive transport management solution for towing and transport businesses, offering real-time GPS tracking, driver dispatch, fleet management, and more.

## Development Setup

### Prerequisites

- Node.js 20.10.0 or later
- Yarn 3.6.4 or npm 10.5.0

### Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development Mode Features

In development mode, the following features work with mocks:

- **Authentication**: A mock user is provided without needing real Auth0 credentials
- **QuickBooks Integration**: Mock endpoints for connecting to QuickBooks
- **API Endpoints**: Local mock implementations of backend API endpoints

## Recent Dependency Updates

All dependencies have been updated to ensure compatibility:

1. **React Versions**:
   - Using React 18.2.0 (stable version)
   - Aligned React DOM version with React

2. **Auth0 Integration**:
   - Using @auth0/nextjs-auth0 version 2.0.0
   - Development mode works with mock authentication

3. **Next.js**:
   - Using Next.js 14.1.0 (stable version)

4. **React Query**:
   - Using @tanstack/react-query version 4.32.6

## Configuration for Production

For production deployment, you need to set up the following:

### Auth0 Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='https://your-domain.com'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
AUTH0_AUDIENCE='your-api-identifier'
```

### QuickBooks Integration

Add the following environment variables for QuickBooks integration:

```
# QuickBooks Configuration
QUICKBOOKS_CLIENT_ID='your-quickbooks-client-id'
QUICKBOOKS_CLIENT_SECRET='your-quickbooks-client-secret'
QUICKBOOKS_REDIRECT_URI='https://your-domain.com/api/quickbooks/callback'
QUICKBOOKS_SANDBOX=true # Set to false for production
```

## Project Structure

- `src/app/`: Main application code
  - `api/`: API routes (Auth0, QuickBooks, etc.)
  - `dashboard/`: Dashboard pages
  - `providers/`: React context providers
  - `page.tsx`: Landing page
  - `layout.tsx`: Root layout
- `public/`: Static assets

## Features

- Multi-Vehicle VIN Scanning
- Real-Time GPS Tracking
- Driver Dispatch & Load Management
- Fleet Management & Inspections
- QuickBooks Integration
- Temporary Storage Tracking
