# TowTrace Dashboard

This is the web dashboard for the TowTrace application, built with Next.js 13 and TypeScript.

## Features

- 🌐 Landing page that highlights the TowTrace application
- 🚚 Vehicle management with VIN scanning 
- 👨‍💼 Driver management and real-time location tracking
- 📋 Job assignment and tracking
- 📱 Responsive design that works on desktop and mobile
- 🎨 Apple-inspired design system

## Project Structure

- `src/app/` - Main application code using Next.js App Router
  - `page.tsx` - Landing page
  - `layout.tsx` - Root layout with common elements
  - `dashboard/` - Dashboard pages
    - `page.tsx` - Dashboard overview
    - `vehicles/` - Vehicle management
    - `drivers/` - Driver management
    - `jobs/` - Job management
- `public/` - Static assets

## Development

### Prerequisites

- Node.js 16.8.0 or later
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

## Troubleshooting

If you encounter any issues:

1. Make sure your Node.js version is 16.8.0 or later
2. Delete the `.next` folder and run `npm run dev` again
3. Check for any error messages in the console

## License

This project is private and not open for redistribution.