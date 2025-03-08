# TowTrace Project Rules

## Coding Standards

- All functions must be less than 50 lines where possible
- Every function must have mandatory comments describing purpose, params, and return values
- No removal of existing features without approval
- All code must be TypeScript compatible
- Follow security best practices (no exposed API keys, proper authentication, etc.)
- Follow Towbook design patterns for consistency
- Create Mermaid diagrams for each PR to visualize changes
- **File names must be relevant to their contained functions/components**
  - Component files should be named after the primary component they export
  - Utility files should describe their primary function
  - API endpoint files should reflect the resource/action they represent

## TypeScript Standards

- Use proper typing for all variables, functions, and components
- Avoid use of `any` type where possible
- Use interfaces for defining shapes of objects
- Use enums for fixed sets of values
- Ensure all React components have proper prop types

## React/React Native Standards

- Use functional components with hooks
- Follow Apple-inspired design principles
- Use consistent styling across components
- Card-based UI components with rounded corners
- Large, colored icons with labels
- Handle offline capabilities properly

## Next.js Standards

- Use App Router pattern (/app directory)
- Separate components into logical folders
- Use proper layout nesting
- Implement both server and client components appropriately

## API Standards

- Follow RESTful principles
- Implement proper authentication
- Validate all inputs using Zod
- Handle errors gracefully
- Document all endpoints

## Commands

### Linting Commands
```bash
# Frontend web dashboard
cd frontend/towtrace-dashboard-new
npm run lint

# Mobile driver app
cd mobile/TowTraceDriverApp-New
npm run lint

# Mobile dispatch app
cd mobile/TowTraceDispatchApp-New
npm run lint

# Backend API
cd backend/towtrace-api
npm run lint
```

### Type Checking Commands
```bash
# Frontend web dashboard
cd frontend/towtrace-dashboard-new
npm run typecheck

# Mobile driver app
cd mobile/TowTraceDriverApp-New
npm run typecheck

# Mobile dispatch app
cd mobile/TowTraceDispatchApp-New
npm run typecheck

# Backend API
cd backend/towtrace-api
npm run typecheck
```

### Testing Commands
```bash
# Frontend web dashboard
cd frontend/towtrace-dashboard-new
npm test

# Mobile driver app
cd mobile/TowTraceDriverApp-New
npm test

# Mobile dispatch app
cd mobile/TowTraceDispatchApp-New
npm test

# Backend API
cd backend/towtrace-api
npm test
```

### Development Commands
```bash
# Frontend web dashboard
cd frontend/towtrace-dashboard-new
npm run dev

# Mobile driver app
cd mobile/TowTraceDriverApp-New
npx react-native start
# In another terminal
npx react-native run-android  # or run-ios on Mac

# Mobile dispatch app
cd mobile/TowTraceDispatchApp-New
npx react-native start
# In another terminal
npx react-native run-android  # or run-ios on Mac

# Backend API
cd backend/towtrace-api
npm run dev
# or
wrangler dev
```

### Deployment Commands
```bash
# Frontend web dashboard
cd frontend/towtrace-dashboard-new
npm run build
npm run start

# Mobile driver app
cd mobile/TowTraceDriverApp-New
npm run build:android  # or build:ios on Mac

# Mobile dispatch app
cd mobile/TowTraceDispatchApp-New
npm run build:android  # or build:ios on Mac

# Backend API
cd backend/towtrace-api
wrangler publish
```