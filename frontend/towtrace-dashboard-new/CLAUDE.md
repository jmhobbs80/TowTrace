# TowTrace Mobile and Web Application

## Project Overview

- Location: /mnt/c/Users/jhobb/TowTrace (or /home/yourusername/towtrace if copied to WSL filesystem)
- Components:
  - Mobile Apps: TowTraceDriverApp-New (for drivers) and TowTraceDispatchApp-New (for dispatchers), built with React Native and TypeScript, targeting Android and iOS
  - Web App: Web-based dashboard using Next.js App Router and TypeScript, linked to www.towtrace.com
  - Backend API: towtrace-api at https://towtrace-api.justin-michael-hobbs.workers.dev
- Technology: React Native, Next.js, TypeScript, TailwindCSS
- Domain: www.towtrace.com (for web), localhost:3000 (for web development)
- Environment: Node.js, npm
- Current Date: March 3, 2025

## Project Progress

- **Mobile Apps**: Completely reimplemented as TowTraceDriverApp-New and TowTraceDispatchApp-New with improved UI/UX, Apple-inspired design, offline capabilities, and better code organization.
- **Web Dashboard**: Successfully migrated from Pages Router to App Router structure with improved responsive design and added major functionality:
  - Duty status management for drivers (On Duty/Off Duty/On Break)
  - Automatic GPS activation based on duty status and load assignment
  - FMCSA-compliant vehicle inspections with conditional photo requirements
  - Interactive driver location tracking with battery-friendly mode
  - Clickable dashboard tiles for quick navigation
  - Enhanced driver detail pages with live GPS tracking
  - Bulk vehicle pickup functionality
  - Client contact search to reduce duplicate entries

## Features of the TowTrace Application

### Mobile Apps (TowTraceDriverApp-New and TowTraceDispatchApp-New)

- **Shared Features**:
  - Role-based navigation with Google OAuth authentication for drivers and dispatchers
  - Offline queuing for all features, ensuring functionality without internet connectivity
  - Error handling with Alert components for API, network, and authentication issues
  - Integration with towtrace-api for real-time data syncing and updates
  - Apple-inspired design with clean, intuitive layout, large, rounded, colored icons and labels
  - Card-based UI components and consistent styling across both apps

- **TowTraceDriverApp-New Specific Features**:
  - Multi-vehicle VIN scanning with camera functionality, supporting up to 4 optional vehicle photos
  - Real-time GPS tracking for job management, displaying vehicle and driver locations on maps
  - Pre-trip inspections with automated logs, required fields (tire pressure, brakes, lights), and optional photo uploads
  - Duty status management (On Duty/Off Duty/On Break) with automatic GPS activation
  - Battery-friendly location tracking that intelligently adjusts based on driver status
  - Automated dropoff alerts when arriving at a destination location
  - FMCSA-compliant vehicle inspection forms with pass/fail options and photo evidence for failures
  - Placeholder screens for dispatcher-only features with clear messaging

- **TowTraceDispatchApp-New Specific Features**:
  - Real-time vehicle tracking for fleet management, displayed on maps with vehicle details
  - Job assignment for driver dispatch and load management, including multi-stop routing
  - Driver management with real-time status indicators and assignment features
  - Vehicle management with status tracking and location monitoring
  - Live monitoring of driver duty status changes with notifications
  - FMCSA inspection report review and management
  - Dropoff verification with photo evidence review capabilities

### Web App (TowTrace Dashboard)

- **Landing Page**:
  - Public page describing the TowTrace application with key features
  - Call-to-action button for login or signup

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
  - Bulk vehicle pickup support with table view of multiple vehicles
  - Client search functionality to streamline job creation

## Recently Completed Features

1. **Bulk Vehicle Pickup**:
   - Added toggle for enabling/disabling bulk pickup mode in job creation form
   - Created multi-vehicle entry form with VIN, make, model, and year fields
   - Implemented tabular view of all vehicles added to the bulk pickup
   - Added functionality to add or remove vehicles from the list

2. **Client Contact Search**:
   - Added searchable dropdown for selecting previous clients
   - Implemented filtering of clients based on name, phone, or email
   - Auto-fills client contact information when a client is selected
   - Reduces duplicate entries and streamlines job creation

3. **Driver Status Management**:
   - Added prominent duty status controls (On Duty/Off Duty/On Break) in the driver profile screen
   - Implemented automatic GPS activation/deactivation based on duty status
   - Added visual indicators showing current status throughout the app

4. **FMCSA Inspection Enhancements**:
   - Updated inspection forms to match FMCSA compliance requirements
   - Implemented Pass/Fail toggles for each inspection item
   - Added conditional photo upload requirements only for failed items

## Upcoming Features and Tasks

1. **API Integration**:
   - Connect all dashboard features to the TowTrace API endpoints
   - Replace mock data with live data flows from the backend
   - Implement proper error handling and loading states

2. **Mobile-Web Synchronization**:
   - Ensure consistent data format between mobile apps and web dashboard
   - Implement real-time updates for driver status changes across platforms
   - Create unified notification system for alerts across all platforms

3. **Authentication Enhancement**:
   - Complete Google OAuth integration with proper token management
   - Implement role-based access controls for drivers vs. dispatchers
   - Add session persistence and refresh token handling

4. **Testing and Production Readiness**:
   - Add comprehensive end-to-end and unit tests
   - Optimize performance for production use
   - Set up CI/CD pipeline for automated testing and deployment

5. **Mobile App Updates**:
   - Update mobile apps to support new bulk vehicle pickup functionality
   - Implement client search in the mobile apps to match web dashboard

## Instructions to Run the Project

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

## Web Dashboard Architecture

The web dashboard follows Next.js App Router architecture:

1. **/app**: Main application directory
   - layout.tsx: Root layout with navigation
   - page.tsx: Landing page
   - dashboard/: Dashboard pages
     - page.tsx: Main dashboard overview
     - drivers/: Driver management screens
     - vehicles/: Vehicle management screens
     - jobs/: Job management screens
       - new/: Job creation form with bulk pickup option
       - scan/: VIN scanning functionality
     - profile/: User profile settings
     - inspections/: FMCSA inspection forms and records
     - eld-logs/: Electronic logging device records

2. **/components**: Reusable UI components
   - Layout components (headers, navigation)
   - Form controls and inputs
   - Cards and information displays
   - Map components for location tracking

3. **/styles**: Global CSS and styling utilities

## API Integration

All applications connect to the towtrace-api backend with the following endpoints:

- `/auth`: Authentication endpoints
- `/vehicles`: Vehicle management
- `/drivers`: Driver management
- `/jobs`: Job assignment and tracking
- `/tracking`: GPS location tracking
- `/inspections`: Vehicle inspection reports
- `/clients`: Client management and search

## Testing & Code Quality

- TypeScript for type safety
- Tailwind CSS for styling consistency
- Component isolation for better testability
- React Testing Library for component tests

## Common Commands

### Development Commands:
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Run tests
npm run test
```

### Git Commands:
```bash
# Create a new branch
git checkout -b feature/new-feature-name

# Commit changes
git add .
git commit -m "Feature: Description of the change"

# Push changes
git push origin feature/new-feature-name
```