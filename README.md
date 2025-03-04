# TowTrace - Complete Fleet Management System

TowTrace is a comprehensive fleet management and towing operations platform built for towing companies, offering a complete solution with mobile apps for drivers and dispatchers, plus a web dashboard for administrators and fleet managers.

## 🚚 Overview

TowTrace streamlines towing operations with:

- **Driver App**: Mobile app for drivers to manage VIN scanning, inspections, GPS tracking and more
- **Dispatcher App**: Mobile app for dispatchers to handle job assignments, fleet tracking, and driver management
- **Web Dashboard**: Administrative console for operations management, reporting, and system configuration
- **Backend API**: Cloud-based API running on Cloudflare Workers for seamless data synchronization

## ✨ Features

- **Comprehensive Vehicle Management**
  - VIN scanning with photo documentation
  - FMCSA-compliant inspections
  - Real-time location tracking
  - Storage yard management

- **Driver Management**
  - Duty status tracking (On Duty/Off Duty/On Break)
  - Hours of Service (HOS) compliance
  - ELD (Electronic Logging Device) integration
  - Performance monitoring

- **Job Management**
  - Multi-stop routing
  - GPS-based ETA calculations
  - Automated arrival/departure detection
  - Dropoff verification with photo evidence

- **Business Operations**
  - QuickBooks integration
  - Subscription-based access control
  - Multi-tenant architecture
  - Advanced analytics and reporting

- **Offline Support**
  - Complete offline operation capability
  - Automatic synchronization when connectivity returns
  - Data conflict resolution

## 🛠️ Architecture

TowTrace is built using modern technologies:

- **Mobile Apps**: React Native with TypeScript
- **Web Dashboard**: Next.js with App Router and Tailwind CSS
- **Backend API**: Cloudflare Workers with Hono.js and D1 Database
- **Authentication**: Google OAuth with JWT tokens

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v8+)
- React Native environment for mobile development
- Cloudflare Wrangler CLI for backend development

### Running the Web Dashboard

```bash
cd frontend/towtrace-dashboard-new
npm install
npm run dev
# Access at http://localhost:3000
```

### Running the Driver App

```bash
cd mobile/TowTraceDriverApp-New
npm install
npx react-native start
# In a new terminal
npx react-native run-android
# OR for iOS
npx react-native run-ios
```

### Running the Dispatcher App

```bash
cd mobile/TowTraceDispatchApp-New
npm install
npx react-native start
# In a new terminal
npx react-native run-android
# OR for iOS
npx react-native run-ios
```

### Running the Backend API

```bash
cd backend/towtrace-api
npm install
npm run dev
# API available at http://localhost:8787
```

## 📱 Mobile App Features

### Driver App
- VIN scanning with camera
- Vehicle inspections
- Location tracking
- HOS compliance
- Duty status management
- Offline capabilities

### Dispatcher App
- Job assignment
- Fleet tracking
- Driver management
- Inspection review
- Customer management
- Advanced routing

## 🖥️ Dashboard Features

- Administrative controls
- Fleet management
- Driver oversight
- ELD logs
- Financial integration
- Multi-tenant management
- Subscription control

## 📝 License

Proprietary - All rights reserved

## 📞 Contact

For more information, visit [www.towtrace.com](https://www.towtrace.com)