# TowTrace Dashboard

This is the web dashboard for the TowTrace application, built with Next.js 13 and TypeScript.

## Features

- 🌐 Landing page that highlights the TowTrace application
- 🚚 Vehicle management with VIN scanning 
- 👨‍💼 Driver management and real-time location tracking
- 📋 Job assignment and tracking
- 📱 Responsive design that works on desktop and mobile
- 🎨 Apple-inspired design system
- 🔒 Secure, role-based authentication
- 📊 ELD logs with FMCSA compliance reporting
- 📍 Battery-friendly GPS tracking
- 💳 QuickBooks integration for financial management
- 📈 Advanced analytics and reporting

## Project Structure

- `src/app/` - Main application code using Next.js App Router
  - `page.tsx` - Landing page
  - `layout.tsx` - Root layout with common elements
  - `context/` - React Context providers
  - `dashboard/` - Dashboard pages
    - `page.tsx` - Dashboard overview
    - `vehicles/` - Vehicle management
    - `drivers/` - Driver management
    - `jobs/` - Job management
    - `eld-logs/` - ELD compliance logs
    - `inspections/` - Vehicle inspections
    - `documents/` - Driver documents
    - `settings/` - Application settings
- `src/components/` - Shared UI components
- `src/services/` - Business logic and API services
- `src/utils/` - Utility functions and helpers
- `public/` - Static assets

## Development

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

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

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

To build for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment

This dashboard can be easily deployed to platforms like Vercel or Netlify. For domain setup, you'll need to:

1. Register the domain (e.g., www.towtrace.com)
2. Set up DNS records to point to your hosting provider
3. Configure HTTPS for secure connections

## API Integration

The dashboard connects to the TowTrace API at:
https://towtrace-api.justin-michael-hobbs.workers.dev

To configure the API connection, create a `.env.local` file at the project root:

```
NEXT_PUBLIC_API_URL=https://towtrace-api.justin-michael-hobbs.workers.dev
```

## Testing

The project includes comprehensive unit tests for:

- Utility functions (`/utils`)
- Services (`/services`)
- Context providers (`/app/context`)

Run tests with:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run tests in watch mode (during development)
npm test -- --watch
```

### Code Quality

The codebase follows these standards:

- All functions must be less than 50 lines where possible
- Every function must have JSDoc comments describing purpose, params, and return values
- Magic numbers are replaced with named constants
- File names match their primary export

## Authentication

Authentication uses Google OAuth via NextAuth.js. For local development, the system uses mock authentication with predefined test users:

- **Admin User**: Used for administrative testing (auto-login when not in production)
- **Driver User**: Used for driver-specific feature testing

## Troubleshooting

If you encounter any issues:

1. Make sure your Node.js version is 18.0.0 or later
2. Delete the `.next` folder and run `npm run dev` again
3. Check for any error messages in the console
4. Make sure all tests are passing with `npm test`

## License

This project is private and not open for redistribution.