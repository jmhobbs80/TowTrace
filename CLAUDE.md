# TowTrace Web-Based Dashboard

## Project Overview
- Location: /mnt/c/Users/jhobb/TowTrace/frontend/towtrace-dashboard (update existing Next.js project)
- Technology: Next.js, TypeScript, Node.js 20.10.0
- Dependencies: next, react, react-dom, react-query, @auth0/nextjs-auth0, @quickbooks-integrations/quickbooks, next-seo, react-map-gl, react-haptic-feedback (optional)
- Backend API: towtrace-api at https://towtrace-api.justin-michael-hobbs.workers.dev
- Domain: localhost:3000 (for development), www.towtrace.com (for production)
- Environment: Node.js 20.10.0, Yarn 3.6.4, npm 10.5.0
- Current Date: March 2, 2025

## Project Progress
- **Web App (Next.js)**: Partially set up and accessible via `npm run dev` on localhost:3000, but shows an internal error. Requires resolution of dependency issues preventing proper display.

## Web App Instructions
- **Diagnose and Fix Dependency Issues**:
  - Location: /mnt/c/Users/jhobb/TowTrace/frontend/towtrace-dashboard
  - Identify and resolve any dependency issues in package.json, npm, or Yarn that are causing the internal error on localhost:3000 when running `npm run dev`.
  - Check for:
    - Missing or incompatible package versions (e.g., next, react, react-dom, react-query, @auth0/nextjs-auth0, @quickbooks-integrations/quickbooks, next-seo, react-map-gl, react-haptic-feedback).
    - 404 Not Found errors or registry issues (e.g., npm registry connectivity, package typos, or deprecated versions).
    - Peer dependency mismatches (e.g., TypeScript version conflicts with Next.js or other libraries).
    - Node.js or Yarn configuration errors (e.g., incompatible versions, corrupted node_modules, or lock file inconsistencies).
  - Update package.json to use stable, compatible versions of dependencies:
    - next@^14.1.0
    - react@^18.2.0
    - react-dom@^18.2.0
    - react-query@^4.0.0
    - @auth0/nextjs-auth0@^2.0.0
    - @quickbooks-integrations/quickbooks@^2.0.18 (already fixed per your update)
    - next-seo@^6.4.0
    - react-map-gl@^7.1.7
    - react-haptic-feedback@^1.0.1 (ensure availability or install from GitHub if needed)
  - Resolve any npm or Yarn errors (e.g., EPERM, 404, peer dependency warnings) by:
    - Clearing caches and reinstalling dependencies:
      ```bash
      rm -rf node_modules package-lock.json yarn.lock
      yarn install