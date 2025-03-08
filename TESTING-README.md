# TowTrace Test Implementation Guide

This document provides a guide to the testing infrastructure we've implemented for the TowTrace project.

## Overview

We've established a comprehensive testing framework across all components of the TowTrace application:

1. **Backend API**: Tests for authentication, subscription checks, data validation, and API endpoints
2. **Frontend Dashboard**: Tests for core components, utilities, and services
3. **Mobile Applications**: Tests for screens, services, and hooks

## Test Structure

### Backend Tests

Backend tests are structured to validate:

- **Middleware Functions**: Authentication and authorization
- **Data Validation**: Schema validation with Zod
- **API Endpoints**: Request handling and response formatting
- **Business Logic**: Core application rules

Example from `auth.test.ts`:
```typescript
describe('Authentication Middleware', () => {
  describe('verifyToken', () => {
    it('should return null when no authorization header is present', async () => {
      const request = createMockRequest();
      const result = await verifyToken(request, mockEnv);
      expect(result).toBeNull();
    });

    // More tests...
  });
});
```

### Frontend Tests

Frontend tests focus on:

- **Component Rendering**: Ensuring components render correctly
- **User Interactions**: Testing button clicks, form inputs, etc.
- **State Management**: Validating state updates work correctly
- **Services and Utils**: Testing business logic and helper functions

Example from `SortableTable.test.tsx`:
```typescript
it('sorts data when clicking on a column header', async () => {
  render(<SortableTable data={mockData} columns={mockColumns} />);
  
  // Initial order (unsorted)
  const nameHeaders = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
  expect(nameHeaders[0]).toHaveTextContent('Alice');
  
  // Click on the Name column header to sort ascending
  fireEvent.click(screen.getByText('Name'));
  
  // Assert order after ascending sort
  const nameHeadersAfterAsc = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
  expect(nameHeadersAfterAsc[0]).toHaveTextContent('Alice');
  // More assertions...
});
```

### Mobile Tests

Mobile tests validate:

- **Screen Rendering**: Ensuring screens render correctly
- **Service Functionality**: API calls, device features, and offline capabilities
- **User Flows**: Core application workflows
- **Platform Integration**: Device feature integration

Example from `EldDashboard.test.tsx`:
```typescript
it('renders dashboard with HOS summary when access is granted', async () => {
  const { findByText } = render(<EldDashboard />);
  
  expect(await findByText('ELD Dashboard')).toBeTruthy();
  expect(await findByText('Current Status')).toBeTruthy();
  
  // Verify HOS summary data is displayed
  expect(await findByText('ON DUTY')).toBeTruthy();
  expect(await findByText(/Drive Time Remaining/)).toBeTruthy();
  expect(await findByText(/6h 0m/)).toBeTruthy(); // 360 minutes = 6h 0m
});
```

## Running Tests

### Running All Tests

To run all tests across the entire project:

```bash
./run-tests.sh
```

### Running Component-Specific Tests

#### Backend Tests

```bash
cd backend/towtrace-api
npm test
# Or for a specific test file
npm test -- auth.test.ts
```

#### Frontend Tests

```bash
cd frontend/towtrace-dashboard-new
npm test
# Or for a specific test file
npm test -- SortableTable
```

#### Mobile Tests

```bash
cd mobile/TowTraceDriverApp-New
npm test
# Or for a specific test file
npm test -- EldDashboard
```

## Continuous Integration

We've set up GitHub Actions to automatically run tests on:
- Push to the master branch
- Pull requests to master

The workflow is defined in `.github/workflows/test.yml`.

## Pre-commit Hooks

We've implemented git hooks to run type checking and linting before commits:

1. To install the hooks:
   ```bash
   git config core.hooksPath git-hooks
   ```

2. The pre-commit hook:
   - Detects which components have changes
   - Runs type checking for changed components
   - Runs linting for changed components

See `git-hooks/README.md` for more details.

## Future Testing Improvements

For details on upcoming testing improvements, see `NEXT-STEPS.md`.

## Test Coverage

Current test coverage is approximately:
- Backend API: ~50-60%
- Frontend Web App: ~50-60%
- Mobile Apps: ~40-50%

Our goal is to reach 70% coverage across all components.

## Contributing to Tests

When writing new features, please follow these guidelines:

1. **Write Tests First**: Use test-driven development when possible
2. **Test Edge Cases**: Include error paths and boundary conditions
3. **Keep Tests Fast**: Avoid unnecessary complexity in tests
4. **Test Real Behavior**: Focus on user-facing behavior, not implementation details

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)