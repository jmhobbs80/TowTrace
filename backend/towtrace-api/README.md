# TowTrace API

A powerful API for the TowTrace transport management system built with Cloudflare Workers and TypeScript.

## Overview

TowTrace API provides a comprehensive backend for:
- Transport management
- Vehicle tracking
- Driver management
- Job assignments
- ELD (Electronic Logging Device) integration
- Subscription management
- Inspection reporting

## Features

- **Subscription Management**: Tiered access (Basic, Premium, Enterprise) to features
- **ELD Integration**: Connect with TowTrace's proprietary ELD devices
- **Hours of Service Tracking**: Monitor driver HOS compliance
- **QuickBooks Integration**: Automatic billing and payment processing
- **Multi-tenant Support**: Secure data isolation between organizations
- **Role-based Access Control**: Granular permissions system

## API Endpoints

### Authentication

- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/refresh`: Refresh authentication token
- `GET /api/auth/verify`: Verify token validity

### Subscription Management (Overwatch)

- `POST /api/admin/overwatch/tenants`: Create new tenant with subscription
- `PUT /api/admin/overwatch/tenants/:tenantId`: Update tenant subscription
- `GET /api/admin/overwatch/tenants`: List all tenants
- `GET /api/admin/overwatch/tenants/:tenantId`: Get tenant details

### Subscription Payments

- `POST /api/subscriptions/payments`: Create new payment
- `GET /api/subscriptions/payments/:tenantId`: Get tenant payment history
- `GET /api/subscriptions/pricing`: Get subscription pricing info

### ELD Integration

- `POST /api/eld/devices`: Register new ELD device
- `POST /api/eld/telemetry`: Process telemetry data from ELD
- `GET /api/eld/devices`: List all ELD devices
- `GET /api/eld/drivers/:driverId/hos`: Get driver's hours of service records

### Vehicles

- `POST /api/vehicles`: Register new vehicle
- `POST /api/vehicles/vin`: Submit vehicle VIN information
- `GET /api/vehicles`: List all vehicles
- `GET /api/vehicles/:id`: Get vehicle details

### Drivers

- `POST /api/drivers`: Create new driver
- `GET /api/drivers`: List all drivers
- `GET /api/drivers/:id`: Get driver details

### Jobs

- `POST /api/jobs`: Create new job
- `GET /api/jobs`: List all jobs
- `GET /api/jobs/:id`: Get job details
- `PUT /api/jobs/:id/status`: Update job status

### Tracking

- `POST /api/tracking/update`: Send location update
- `POST /api/tracking/batch`: Send batch of location updates
- `GET /api/tracking/:jobId`: Get tracking data for job

### Inspections

- `POST /api/inspections`: Submit inspection report
- `GET /api/inspections/:vehicleId`: Get vehicle inspection history

## Subscription Tiers

### Basic Tier
- Vehicle VIN scanning
- Basic GPS tracking
- Job management
- Fleet management
- Pre-trip inspections

### Premium Tier
All Basic features plus:
- QuickBooks integration
- Temporary storage tracking
- ELD device integration
- Advanced analytics (limited)

### Enterprise Tier
All Premium features plus:
- Multi-tenant access
- AI-driven insights
- Advanced routing
- Customer portal
- Law enforcement tools
- Advanced financial reporting

## Development

### Setup

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
```
cp .env.example .env
```

3. Start local development server:
```
npm run dev
```

### Deployment to Cloudflare Workers

```
npm run deploy
```

## Security

- Role-based access control
- Subscription-based feature access
- JWT authentication
- HTTPS-only access
- Rate limiting
- Content Security Policy

## Data Models

The API uses the following main data models:
- Tenant (organization)
- User (admin, dispatcher, driver)
- Vehicle
- Job
- Inspection
- ELD Device
- Hours of Service
- Subscription Feature
- Subscription Payment

## Integration

The API integrates with:
- TowTrace mobile apps (Driver, Dispatcher)
- TowTrace web dashboard
- QuickBooks (for billing)
- TowTrace ELD devices