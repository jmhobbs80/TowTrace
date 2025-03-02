# TowTrace Development Guide

## Build Commands

- **Frontend**: `npm run dev` (development), `npm run build`, `npm run start`, `npm run lint`
- **Backend**: `npm run dev` (Wrangler), `npm run deploy` (production)
- **Mobile**: `npm run start` (Metro), `npm run android`, `npm run ios`
- **Testing**: `npm run test` (all tests), `npx jest path/to/test.js` (single test)

## Code Style

- **TypeScript**: Use strict typing, avoid `any` except when necessary
- **Imports**: Group by source (React → external libraries → local modules)
- **Components**: React functional components with typed props/state
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Error Handling**: Try/catch with specific error types
- **Async**: Prefer async/await with proper error handling
- **API**: RESTful endpoints with Zod schemas for validation
- **Mobile**: React Native components with consistent styling patterns
- **State Management**: React hooks with typed state

# TowTrace Mobile Application

## Project Overview

- Location: /mnt/c/Users/jhobb/TowTrace/mobile (or /home/yourusername/towtrace/mobile if copied to WSL filesystem)
- Apps: TowTraceDriverApp (for drivers) and TowTraceDispatchApp (for dispatchers)
- Technology: React Native 0.78.0, TypeScript, targeting Android and iOS
- Dependencies: react-native, axios, react-native-maps, react-native-vision-camera, @react-navigation/native, @react-navigation/native-stack, @react-native-community/geolocation, @react-native-community/netinfo
- Backend API: towtrace-api at https://towtrace-api.justin-michael-hobbs.workers.dev
- Environment: Node.js 20.10.0, Yarn 3.6.4, react-native-cli 12.3.1
- Current Date: March 2, 2025

## Project Progress

- **TowTraceDriverApp**: Successfully implemented for Android according to requirements, as confirmed by Claude Code. Features include:

  - Role-based navigation with Google OAuth for drivers and dispatchers
  - VINScanner: Multi-vehicle VIN scanning with react-native-vision-camera, supporting up to 4 optional photos, offline queuing with @react-native-community/netinfo, and API integration
  - JobTracker: Real-time GPS tracking with @react-native-community/geolocation, offline queuing, and API integration
  - Inspection: Pre-trip inspections with automated logs and optional photos, offline queuing, and API integration
  - Placeholder screens for dispatcher-only features (FleetTracker, JobAssignment) showing "Not available in Driver App"
  - Error handling with Alert components for API, network, and authentication issues
  - Android setup with package.json, metro.config.js, and android/ configured
  - Needs iOS support added (ios/, Podfile, Info.plist for iOS 13.0+ compatibility)

- **TowTraceDispatchApp**: Exists but requires completion for both Android and iOS. Current structure needs updates to match TowTraceDriverApp’s functionality, including:
  - Role-based navigation with Google OAuth for dispatchers
  - FleetTracker: Real-time vehicle tracking with react-native-maps, offline queuing, and API integration
  - JobAssignment: Form for driver dispatch and load management (fields: driverId, vehicleId, pickupLocation, dropoffLocation, multi-stop routing), offline queuing, and API integration
  - Same authentication, offline handling, and error handling as TowTraceDriverApp
  - Needs full implementation of package.json, metro.config.js, android/, and ios/ for Android and iOS compatibility

## Instructions to Complete the Project

## Styling Instructions

- Apply an Apple-style look and feel inspired by iOS design trends (clean minimalism, San Francisco font, gradients, smooth animations) to both TowTraceDriverApp and TowTraceDispatchApp.
- Use colors extracted from the TowTrace logo: [Insert logo colors here, e.g., Primary: #007AFF (blue), Secondary: #34C759 (green), Background: #FFFFFF (white), Text: #000000/#007AFF].
  - Primary color for buttons, active states, and navigation icons.
  - Secondary color for success states, offline indicators, and highlights.
  - Background color for screens, cards, and forms.
  - Text color for body text, links, and labels.
  - Use subtle gradients (e.g., primary-to-background) for interactive elements like offline status or OAuth buttons.
- Use San Francisco font (or Roboto as a fallback) at 16–20pt for body text, 24pt for headings, with bold weights for buttons and labels.
- Implement iOS-style navigation with a bottom tab bar (rounded icons, labels) for screens (VINScanner, JobTracker, Inspection for drivers; FleetTracker, JobAssignment for dispatchers).
- Use large, rounded buttons (corner radius 12–16px), smooth animations (fade, slide) with react-native-animated, and optional haptic feedback with react-native-haptic-feedback.
- Add SF Symbols-like icons or custom icons from the TowTrace logo, rendered in logo colors, for navigation and actions.
- Ensure high-quality, optional vehicle photos (up to 4) in VINScanner and Inspection with blurred backgrounds or subtle shadows, and use clean maps in JobTracker/FleetTracker with Apple’s minimal map styling.

- **General Instructions**:
  - Use Claude 3.5 Sonnet with the Anthropic API key (ANTHROPIC_API_KEY: sk-ant-apio3-0p9hmlmjka4CRINJ_21nljxcmmzSHZ5o_IPINV1tZKjMKfKWv0IBhe7C9Lv51dlnZ2PF_mxID1fYleUDNO9v9fTya-Y8Z1IMAA) for all code generation.
  - Ensure all code is TypeScript, compatible with React Native 0.78.0, and tested for both Android and iOS (iOS setup is optional if no Mac is available but should be configured for future use).
  - Maintain security by ensuring .env and ANTHROPIC_API_KEY are ignored in .gitignore (already set as .env\* and Microsoft.PowerShell_profile.ps1).
  - Do not make changes outside /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDriverApp and /mnt/c/Users/jhobb/TowTrace/mobile/TowTraceDispatchApp (or their WSL equivalents).
  - Provide output with detailed TypeScript comments explaining changes, and include terminal commands to build and run each app on Android and iOS.
