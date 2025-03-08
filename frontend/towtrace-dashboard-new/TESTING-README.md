# TowTrace Dashboard Testing Guide

## Overview

This document describes the testing infrastructure for the TowTrace Dashboard project. The project uses Jest and React Testing Library for unit and integration testing.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: UI component testing utilities
- **Testing Library User Event**: Simulating user events
- **jest-dom**: Custom DOM element matchers

## Test Organization

Tests are organized alongside the code they test. For example:

- `src/components/MyComponent.tsx` → `src/components/MyComponent.test.tsx`
- `src/utils/myUtil.ts` → `src/utils/myUtil.test.ts`
- `src/services/MyService.ts` → `src/services/MyService.test.ts`

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm test -- --coverage
```

### Running Specific Tests

```bash
npm test -- src/components/MyComponent.test.tsx
```

### Running Tests in Watch Mode

```bash
npm test -- --watch
```

### Using the Test Script

We've created a comprehensive test runner script that runs tests by category and generates coverage reports:

```bash
./run-tests.sh
```

## Test Writing Guidelines

### Component Tests

1. Test the component's rendering with default props
2. Test with various prop configurations
3. Test user interactions (clicks, typing, etc.)
4. Test conditional rendering logic
5. Mock external dependencies and context providers

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText('Default Title')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Service Tests

1. Mock external dependencies (API calls, storage, etc.)
2. Test success and error paths
3. Test edge cases and boundary conditions

Example:

```tsx
import MyService from './MyService';
import { api } from '../api';

// Mock dependencies
jest.mock('../api');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const result = await MyService.fetchData(1);
    
    expect(api.get).toHaveBeenCalledWith('/data/1');
    expect(result).toEqual(mockData);
  });

  it('handles fetch errors', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    await expect(MyService.fetchData(1)).rejects.toThrow('Network error');
  });
});
```

### Utility Tests

1. Test with various inputs, including edge cases
2. Test error handling

Example:

```tsx
import { formatDate } from './dateUtils';

describe('dateUtils', () => {
  it('formats dates correctly', () => {
    const date = new Date('2023-01-15T12:00:00Z');
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/15/2023');
  });

  it('handles invalid dates', () => {
    expect(() => formatDate(null as any, 'MM/dd/yyyy')).toThrow();
  });
});
```

## Mocking Guidelines

### Mocking External Modules

```tsx
// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: '123' },
  }),
}));
```

### Mocking API Calls

```tsx
jest.mock('../api', () => ({
  fetchData: jest.fn(),
}));

// In your test
import { fetchData } from '../api';
(fetchData as jest.Mock).mockResolvedValue({ data: 'mocked data' });
```

### Mocking Local Storage

```tsx
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Testing Async Code

For async operations, use `async/await` with `waitFor` or `findBy*` queries:

```tsx
it('loads data asynchronously', async () => {
  render(<MyAsyncComponent />);
  
  // Initially shows loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await screen.findByText('Data loaded');
  
  // Check that loading indicator is gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

## Common Issues and Solutions

### Testing Library Query Priority

Use queries in this order of preference:

1. `getByRole` - Most accessible way to query elements
2. `getByLabelText` - Good for form elements
3. `getByPlaceholderText` - For inputs with placeholders
4. `getByText` - For non-interactive elements
5. `getByDisplayValue` - For form elements with values
6. `getByAltText` - For images
7. `getByTitle` - For elements with title attributes
8. `getByTestId` - Last resort, use `data-testid` attributes

### Testing Library Query Variants

- `getBy*`: Returns the matching element or throws an error
- `queryBy*`: Returns the matching element or null
- `findBy*`: Returns a promise that resolves to the element (for async testing)
- `getAllBy*`, `queryAllBy*`, `findAllBy*`: Return arrays of matching elements

## Code Coverage Targets

- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## Continuous Integration

Tests are run automatically on:
- Pull requests to `main`, `master`, and `develop` branches
- Direct pushes to `main`, `master`, and `develop` branches

The CI pipeline includes:
- Linting
- Type checking
- Unit tests
- Coverage reporting

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Jest DOM Custom Matchers](https://github.com/testing-library/jest-dom)