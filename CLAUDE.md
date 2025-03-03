# TowTrace Mobile and Web Application

## Project Overview

- Location: /mnt/c/Users/jhobb/TowTrace (or /home/yourusername/towtrace if copied to WSL filesystem)
- Components:
  - Mobile Apps: TowTraceDriverApp (for drivers) and TowTraceDispatchApp (for dispatchers), built with React Native and TypeScript, targeting Android and iOS
  - Web App: Web-based dashboard using Next.js and TypeScript, linked to www.towtrace.com
- Technology: React Native, Next.js, TypeScript
- Backend API: towtrace-api at https://towtrace-api.justin-michael-hobbs.workers.dev
- Domain: www.towtrace.com (for web), localhost:3000 (for web development)
- Environment: Node.js, Yarn, npm
- Current Date: March 2, 2025, 5:29 PM PST

## Project Progress

- **TowTraceDriverApp**: Successfully implemented for Android and iOS, as confirmed by previous updates. Features are complete and styled with Apple-inspired design.
- **TowTraceDispatchApp**: Successfully implemented for Android and iOS, mirroring TowTraceDriverApp’s structure and features, styled with Apple-inspired design.
- **Web App (Next.js)**: Partially set up and accessible via `npm run dev` on localhost:3000, but requires completion for www.towtrace.com, landing page, dashboard, and all mobile features with security measures. Dependency issues causing internal errors on localhost:3000 have been identified but need final resolution.

## Features of the TowTrace Application

### Mobile Apps (TowTraceDriverApp and TowTraceDispatchApp)

- **Shared Features**:

  - Role-based navigation with Google OAuth authentication for drivers and dispatchers
  - Offline queuing for all features using appropriate libraries, ensuring functionality without internet connectivity
  - Error handling with Alert components for API, network, and authentication issues
  - Integration with towtrace-api for real-time data syncing and updates
  - Apple-style styling with clean minimalism, San Francisco font (or equivalent), logo-derived colors, gradients, and smooth animations
  - Support for Android and iOS with platform-specific configurations (e.g., permissions, build settings)

- **TowTraceDriverApp Specific Features**:

  - Multi-vehicle VIN scanning with camera functionality, supporting up to 4 optional vehicle photos
  - Real-time GPS tracking for job management, displaying vehicle and driver locations on maps
  - Pre-trip inspections with automated logs, required fields, and optional photo uploads
  - Placeholder screens for dispatcher-only features (FleetTracker, JobAssignment) showing "Not available in Driver App"

- **TowTraceDispatchApp Specific Features**:
  - Real-time vehicle tracking for fleet management, displayed on maps
  - Job assignment for driver dispatch and load management, including multi-stop routing with fields: driverId, vehicleId, pickupLocation, dropoffLocation

### Web App (TowTrace Dashboard)

- **Landing Page**:

  - Public page at / describing the TowTrace application, featuring a header with the TowTrace logo, description of towing and transport management for drivers and dispatchers, and key features (multi-vehicle VIN scanning, real-time GPS tracking, driver dispatch, fleet management, pre-trip inspections, QuickBooks integration, temporary storage tracking, multi-tenant SaaS architecture)
  - Call-to-action (CTA) button for login or signup, styled with Apple-inspired design
  - Security measures: HTTPS enforcement, CSRF protection, Content Security Policy (CSP) headers, rate limiting, and SEO optimization with Next.js

- **Dashboard After Login**:

  - Secure, role-based dashboard accessible after Google OAuth authentication, mirroring all mobile app features:
    - Multi-vehicle VIN scanning with form input, photo uploads (up to 4), and real-time updates from towtrace-api
    - Real-time GPS tracking with interactive maps showing driver and vehicle locations, route optimization, and status (active/pending/completed)
    - Driver dispatch and load management with multi-stop routing, including driverId, vehicleId, pickupLocation, dropoffLocation, and real-time status updates
    - Fleet management and pre-trip inspections with logs, required fields, optional photo uploads, and FMCSA compliance reporting
    - QuickBooks integration for auto-generating invoices and syncing financial data, ensuring secure API calls with OAuth 2.0 and encryption
    - Temporary storage tracking for vehicles in repair shops, displaying repair statuses and automated pickup reminders
    - Multi-tenant SaaS architecture supporting multiple transport businesses with secure data isolation and role-based access control (RBAC)
    - Additional features: User profiles, notification settings, analytics dashboards for performance metrics, and customer support chat (optional)
  - Apple-style styling with clean minimalism, San Francisco font (or equivalent), logo-derived colors, gradients, animations, and large, rounded, interactive elements
  - Security measures: Google OAuth with token storage and session management, HTTPS, CSP, rate limiting, input validation, encryption, RBAC, middleware for authentication/authorization, and prevention of SQL injection, XSS, and other vulnerabilities

- **Technical Setup**:
  - Use Next.js with TypeScript to create the dashboard, linked to www.towtrace.com
  - Configure domain linking for www.towtrace.com with DNS records and hosting (e.g., Vercel, Netlify)
  - Update configuration files (next.config.js, tsconfig.json) for TypeScript, domain, HTTPS, CSP, and environment variables
  - Use environment variables in .env.local for API keys (ANTHROPIC_API_KEY, QuickBooks credentials), ignored in .gitignore
  - Test locally with `npm run dev` on localhost:3000, then deploy to production with `npm run build` and hosting provider deployment
  - Sync data and features with mobile apps via towtrace-api, ensuring real-time updates and offline queuing (via localStorage or IndexedDB for web)
  - Ensure compatibility with mobile app standards (React Native features, TypeScript, Apple-style design)

## Instructions to Complete the Project

- **Complete the Web Dashboard**:

  - Location: /mnt/c/Users/jhobb/TowTrace/frontend/towtrace-dashboard (create if not exists, or update existing Next.js project)
  - Use Next.js and TypeScript to build the web dashboard, implementing all features listed above for the landing page and dashboard
  - Resolve any dependency issues preventing `npm run dev` on localhost:3000 from displaying properly, ensuring no internal errors
  - Apply Apple-style styling across the landing page and dashboard, using logo-derived colors (to be provided), San Francisco font (or equivalent), gradients, and animations
  - Configure domain linking for www.towtrace.com, including DNS setup and HTTPS enforcement
  - Implement all security measures as specified, including Google OAuth, HTTPS, CSP, rate limiting, encryption, and RBAC
  - Integrate with towtrace-api for real-time data and sync with mobile apps
  - Provide detailed TypeScript comments explaining changes, and include terminal commands to build and run the web app (npm run dev, Vercel/Netlify deployment for www.towtrace.com)

- **General Instructions**:
  - Use Claude 3.5 Sonnet with the Anthropic API key (ANTHROPIC_API_KEY: sk-ant-apio3-0p9hmlmjka4CRINJ_21nljxcmmzSHZ5o_IPINV1tZKjMKfKWv0IBhe7C9Lv51dlnZ2PF_mxID1fYleUDNO9v9fTya-Y8Z1IMAA) for all code generation
  - Ensure all code is TypeScript, compatible with Next.js, React Native, and tested for Android, iOS, and web deployment
  - Maintain security by ensuring .env.local, ANTHROPIC_API_KEY, and QuickBooks credentials are ignored in .gitignore (already set as .env\* and Microsoft.PowerShell_profile.ps1)
  - Do not make changes outside /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDriverApp, /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDispatchApp, and /mnt/c/Users/jhobb/TowTrace/frontend/towtrace-dashboard (or their WSL equivalents)
  - Do not specify dependency versions; allow the AI to determine the best versions and tools for React Native, Next.js, and related libraries
  - Provide output with detailed TypeScript comments and terminal commands for building and running each component on Android, iOS, and web

## Additional Notes

- Mobile apps (TowTraceDriverApp, TowTraceDispatchApp) are complete and styled with Apple-inspired design; focus on web completion
- Web deployment to www.towtrace.com requires domain setup (DNS, hosting provider like Vercel or Netlify), HTTPS, and testing with npm run dev first
- iOS setup for mobile apps requires a Mac or cloud Mac service (e.g., MacStadium) for final testing; focus on Android and web if no Mac is available
- Monitor Anthropic API usage in the Anthropic Console (console.anthropic.com) to avoid rate limits
- Use /apply to save changes after each prompt, and verify generated files with ls and cat commands in WSL
