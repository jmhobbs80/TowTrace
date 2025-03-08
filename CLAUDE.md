# TowTrace Mobile and Web Application

## Project Overview

- Location: /mnt/c/Users/jhobb/TowTrace (or /home/yourusername/towtrace if copied to WSL filesystem)
- Components:
  - Mobile Apps: TowTraceDriverApp-New (for drivers) and TowTraceDispatchApp-New (for dispatchers), built with React Native and TypeScript, targeting Android and iOS
  - Web App: Web-based dashboard using Next.js App Router and TypeScript, linked to www.towtrace.com
  - Backend API: towtrace-api at https://towtrace-api.justin-michael-hobbs.workers.dev
- Technology: React Native, Next.js, TypeScript, Cloudflare Workers
- Domain: www.towtrace.com (for web), localhost:3000 (for web development)
- Environment: Node.js, npm
- Current Date: March 8, 2025

## Application Features

### Core Platform Features

- **Multi-Tenant Architecture**:
  - Support for multiple towing companies with isolated data
  - Role-based access control (system_admin, client_admin, admin, dispatch, driver)
  - Subscription-based feature access
  - Overwatch admin panel for system administrators

- **Authentication & Security**:
  - Google OAuth integration
  - JWT-based authentication
  - Role-based permissions
  - Secure API endpoints with proper authorization

- **Subscription Management**:
  - Tiered subscription plans (Basic, Pro, Enterprise)
  - Feature availability based on subscription level
  - Payment processing and management
  - Automatic renewal and notifications

- **Offline Capabilities**:
  - Queue system for all operations when offline
  - Data synchronization when connectivity is restored
  - Local storage of critical information
  - Conflict resolution for data changes

### Mobile Apps (TowTraceDriverApp-New and TowTraceDispatchApp-New)

- **Shared Features**:
  - Role-based navigation with Google OAuth authentication
  - Offline queuing for all features, ensuring functionality without internet connectivity
  - Error handling with Alert components for API, network, and authentication issues
  - Integration with towtrace-api for real-time data syncing and updates
  - Apple-inspired design with clean, intuitive layout, large, rounded, colored icons and labels
  - Card-based UI components and consistent styling across both apps
  - Subscription feature access control

- **TowTraceDriverApp-New Specific Features**:
  - Multi-vehicle VIN scanning with camera functionality, supporting up to 4 optional vehicle photos
  - Real-time GPS tracking for job management, displaying vehicle and driver locations on maps
  - Pre-trip inspections with automated logs, required fields (tire pressure, brakes, lights), and optional photo uploads
  - Duty status management (On Duty/Off Duty/On Break) with automatic GPS activation
  - Battery-friendly location tracking that intelligently adjusts based on driver status
  - Automated dropoff alerts when arriving at a destination location
  - FMCSA-compliant vehicle inspection forms with pass/fail options and photo evidence for failures
  - ELD (Electronic Logging Device) integration for Hours of Service compliance
  - Storage tracking for vehicles in yard management
  - Law enforcement integration tools
  - DriverWallet for document storage and expiration tracking

- **TowTraceDispatchApp-New Specific Features**:
  - Real-time vehicle tracking for fleet management, displayed on maps with vehicle details
  - Job assignment for driver dispatch and load management, including multi-stop routing
  - Driver management with real-time status indicators and assignment features
  - Vehicle management with status tracking and location monitoring
  - Live monitoring of driver duty status changes with notifications
  - FMCSA inspection report review and management
  - Dropoff verification with photo evidence review capabilities
  - Advanced routing with ETA calculation and optimization
  - Customer management and communication tools
  - Quickbooks integration for invoicing
  - Task management system for creating, assigning, and tracking tasks

### Web App (TowTrace Dashboard)

- **Landing Page**:
  - Public page describing the TowTrace application with key features
  - Call-to-action button for login or signup
  - Subscription plan information and pricing

- **Dashboard After Login**:
  - Secure, role-based dashboard accessible after Google OAuth authentication
  - Mobile-responsive design with modern UI components
  - Cards-based layout for quick access to key functions with clickable navigation tiles
  - Role-specific features for drivers, dispatchers, and administrators
  - Activity feed for recent updates and actions
  - Driver duty status controls with clear visual indicators
  - Interactive maps showing real-time driver and vehicle locations
  - FMCSA-compliant inspection form creation and management
  - Battery-friendly GPS tracking indicators and controls
  - ELD logs with FMCSA compliance reporting
  - Overwatch admin panel for system administrators
  - QuickBooks integration for financial management
  - Advanced analytics and reporting
  - Customer portal access management
  - Driver document management with expiration tracking
  - User notification center with customizable preferences

## Dependencies

### Backend Dependencies

- **Framework & Core**:
  - Hono.js (API framework)
  - Cloudflare Workers (serverless platform)
  - Zod (validation)
  - UUID (unique ID generation)
  - Chanfana (API schema)

- **Database & Storage**:
  - Cloudflare D1 (SQL database)
  - Cloudflare KV (key-value storage)
  - Cloudflare R2 (object storage for images)

- **Authentication & Security**:
  - JWT (JSON Web Tokens)
  - Google OAuth integration

### Web Dashboard Dependencies

- **Framework & Core**:
  - Next.js (React framework)
  - React (UI library)
  - TypeScript (type safety)

- **UI & Styling**:
  - Tailwind CSS (utility-first CSS)
  - @tailwindcss/forms (form styling)
  - Headless UI (unstyled components)

- **Data Fetching & State**:
  - SWR (data fetching)
  - React Query (async state management)

- **Maps & Location**:
  - Mapbox GL JS (mapping)
  - Turf.js (geospatial analysis)

- **Integration**:
  - QuickBooks API (financial integration)

### Mobile App Dependencies

- **Framework & Core**:
  - React Native (mobile framework)
  - TypeScript (type safety)

- **Navigation & UI**:
  - React Navigation (screen navigation)
  - React Native Paper (UI components)

- **Device Features**:
  - React Native Vision Camera (camera access)
  - React Native Image Picker (photo selection)
  - React Native Permissions (permissions management)
  - React Native Geolocation (location services)
  - React Native Maps (mapping)
  - AsyncStorage (local storage)
  - NetInfo (network connectivity)

- **Networking & Data**:
  - Axios (HTTP client)
  - React Query (data fetching)

## Architecture

### Backend Architecture

- **Cloudflare Workers-based API**:
  - Serverless architecture for scalability
  - Global distribution with low latency
  - Edge computing capabilities

- **Database**:
  - D1 SQL database with comprehensive schema
  - Tables for tenants, users, vehicles, jobs, job_stops, tracking_locations, eld_devices, eld_hours_of_service, driver_documents, tasks, etc.
  - Document storage with expiration tracking
  - User notification preferences system
  - Relational data model with proper foreign keys

- **API Structure**:
  - Models with Zod validation schemas
  - Controllers for domain-specific logic
  - Middleware for authentication and authorization
  - Services for business logic
  - Endpoints for HTTP route handling

- **Authentication Flow**:
  - Google OAuth for user authentication
  - JWT token generation and validation
  - Role-based access control

### Web Dashboard Architecture

- **Next.js App Router Architecture**:
  - /app directory structure
  - Server and client components
  - Layout nesting for consistent UI
  - Route groups for logical organization

- **Component Structure**:
  - Atomic design principles
  - Reusable UI components
  - Context providers for state management
  - Custom hooks for shared logic

### Mobile App Architecture

- **React Native Architecture**:
  - Shared code between iOS and Android
  - Native module integration where needed

- **Component Structure**:
  - App.tsx as the entry point
  - Screen components for each view
  - Reusable UI components
  - Custom hooks for shared logic
  - Services for API integration

## API Endpoints

### Core Endpoints
- `/auth`: Authentication endpoints
- `/vehicles`: Vehicle management
- `/drivers`: Driver management
- `/jobs`: Job assignment and tracking
- `/tracking`: GPS location tracking
- `/inspections`: Vehicle inspection reports
- `/tasks`: Task management endpoints for creating, listing, fetching, and deleting tasks

### Specialized Endpoints
- **Overwatch Admin Endpoints**:
  - `POST /api/admin/overwatch/tenants`: Create tenant
  - `PUT /api/admin/overwatch/tenants/:tenantId`: Update tenant
  - `GET /api/admin/overwatch/tenants`: Get all tenants
  - `GET /api/admin/overwatch/tenants/:tenantId`: Get tenant by ID

- **ELD Endpoints**:
  - `POST /api/eld/devices`: Register device
  - `POST /api/eld/telemetry`: Log telemetry data
  - `GET /api/eld/devices`: Get devices
  - `GET /api/eld/drivers/:driverId/hos`: Get driver hours of service

- **Driver Documents Endpoints**:
  - `POST /api/driver/documents`: Upload driver document
  - `GET /api/driver/documents/:driverId`: Get driver documents
  - `GET /api/notifications/document-expirations`: Get expiring documents

- **Subscription Endpoints**:
  - `POST /api/subscriptions/payments`: Create payment
  - `GET /api/subscriptions/payments/:tenantId`: Get tenant payments
  - `GET /api/subscriptions/pricing`: Get pricing info
  
- **Premium Tier Endpoints**:
  - `/api/analytics/basic/*`: Basic analytics endpoints
  - `/api/storage/*`: Storage and document management endpoints

- **Enterprise Tier Endpoints**:
  - `/api/ai/*`: AI-powered insights and automation
  - `/api/advanced-routing/*`: Advanced routing algorithms
  - `/api/customer-portal/*`: Customer portal access
  - `/api/law-enforcement/*`: Law enforcement integration

## Launch Preparation Tasks

### Development Completion

1. **Backend API Completion**:
   - Develop ELD telemetry data API endpoint for real-time tracking
   - Implement advanced analytics endpoints for enterprise subscription
   - Complete QuickBooks integration endpoints
   - Add API rate limiting and additional security measures

2. **Mobile App Completion**:
   - Implement duty status management in driver app
   - Add battery-friendly location tracking
   - Implement geofencing for arrival detection
   - Add background tracking service
   - Create dropoff workflows with photo documentation
   - Update inspection forms for FMCSA compliance
   - Optimize offline storage and sync mechanisms

3. **Dashboard Completion**:
   - Connect ELD logs dashboard to real backend data
   - Implement export logs functionality
   - Complete QuickBooks integration interface
   - Develop advanced analytics dashboards
   - Finalize multi-tenant management tools

### Testing & Quality Assurance

1. **Testing Strategy**:
   - Implement end-to-end testing for critical workflows
   - Perform stress testing for API endpoints
   - Conduct usability testing for mobile apps and dashboard
   - Test subscription validation and feature access
   - Validate offline functionality

2. **Performance Optimization**:
   - Optimize API response times for real-time tracking
   - Implement proper caching strategies
   - Reduce mobile app battery consumption
   - Optimize database queries for large datasets

3. **Security Audit**:
   - Perform penetration testing
   - Audit authentication flows
   - Review data encryption practices
   - Verify secure storage of sensitive information

### Deployment Preparation

1. **CI/CD Setup**:
   - Configure GitHub Actions for automated testing
   - Setup deployment pipelines to staging and production
   - Implement automated database migrations

2. **Infrastructure Configuration**:
   - Configure production Cloudflare Workers
   - Setup database backup and restore procedures
   - Configure monitoring and alerting
   - Implement logging and error tracking

3. **Mobile App Store Preparation**:
   - Create app store listings (Google Play and Apple App Store)
   - Prepare screenshots and marketing materials
   - Configure in-app purchase hooks for subscription management
   - Setup TestFlight for iOS beta testing

### Business Readiness

1. **Documentation**:
   - Create API documentation for integrators
   - Write user manuals for dashboard and mobile apps
   - Develop onboarding guides for new customers
   - Document subscription features and limitations

2. **Legal and Compliance**:
   - Ensure FMCSA compliance for all ELD features
   - Finalize privacy policy and terms of service
   - Implement GDPR compliance measures
   - Create data retention policies

3. **Subscription System**:
   - Complete payment processing integration
   - Implement grace periods for expired subscriptions
   - Create renewal notification system
   - Build subscription analytics dashboard

4. **Marketing and Launch Plan**:
   - Develop launch timeline and communication plan
   - Create customer onboarding process
   - Prepare training materials for customer support
   - Design promotional materials and website updates

## Running the Project

### Running the Mobile Apps:

For TowTraceDriverApp-New:
```bash
cd /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDriverApp-New
npm install
npx react-native start
# In a new terminal
npx react-native run-android
# OR for iOS (requires a Mac)
npx react-native run-ios
```

For TowTraceDispatchApp-New:
```bash
cd /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDispatchApp-New
npm install
npx react-native start
# In a new terminal
npx react-native run-android
# OR for iOS (requires a Mac)
npx react-native run-ios
```

### Running the Web Dashboard:

```bash
cd /mnt/c/Users/jhobb/TowTrace/frontend/towtrace-dashboard-new
npm install
npm run dev
# Access the site at localhost:3000
```

### Running the Backend API locally:

```bash
cd /mnt/c/Users/jhobb/TowTrace/backend/towtrace-api
npm install
npm run dev
# API will be available at http://localhost:8787
```

## Additional Notes

- All components use TypeScript for improved type safety and development experience
- Mobile apps support offline functionality with queue systems for uploads when connectivity is restored
- API requests use Bearer token authentication with Google OAuth
- The design is clean, minimalist, and follows modern mobile UI/UX best practices

## Code Quality Standards

- All functions must be less than 50 lines where possible
- Every function must have mandatory comments describing purpose, params, and return values
- Follow function-comment-template.md for proper JSDoc comment format
- Include Mermaid diagrams with every PR using pr-mermaid-template.md
- No feature removal without approval
- Follow TypeScript best practices (proper types, no 'any' where avoidable)
- Follow security best practices (no exposed API keys, proper authentication)
- File names must reflect their contained functions/components
  - Example: UserProfileCard.tsx should contain a UserProfileCard component
  - Example: formatCurrency.ts should contain currency formatting utilities
  - Example: taskCreate.ts should handle task creation endpoints

## Linting and Code Quality Tools

Run the lint-project.sh script to perform comprehensive code quality checks:

```bash
cd /mnt/c/users/jhobb/towtrace
./lint-project.sh
```

This script will:
1. Run ESLint on all components
2. Perform TypeScript type checks
3. Identify functions over 50 lines
4. Find potentially unused imports
5. Generate a comprehensive lint report