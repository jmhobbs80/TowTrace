const nextJest = require('next/jest');

// Providing the path to your Next.js app to load next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
});

// Jest configuration
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/app/api/**/*',
    '!**/node_modules/**',
  ],
  transformIgnorePatterns: [
    // Transform react-dnd modules
    '/node_modules/(?!react-dnd|@react-dnd|dnd-core)/',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);