// Mock modules that aren't available in JSDOM
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: {
      Marker: () => React.createElement('Marker'),
      Polyline: () => React.createElement('Polyline'),
      Callout: () => React.createElement('Callout'),
      Circle: () => React.createElement('Circle'),
    },
    Marker: () => React.createElement('Marker'),
    Polyline: () => React.createElement('Polyline'),
    Callout: () => React.createElement('Callout'),
    Circle: () => React.createElement('Circle'),
  };
});

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => 'Camera',
  useCameraDevices: jest.fn(() => ({
    back: {
      id: 'back',
      hasFlash: true,
    },
    front: {
      id: 'front',
      hasFlash: false,
    },
  })),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(),
  })),
}));

// Mock Geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        altitude: 0,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: 0,
        speed: 0,
      },
      timestamp: 1000,
    });
  }),
  watchPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        altitude: 0,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: 0,
        speed: 0,
      },
      timestamp: 1000,
    });
    return 123;
  }),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve(true)),
  request: jest.fn(() => Promise.resolve(true)),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
  },
}));

// Mock for react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: false, assets: [{ uri: 'file://test.jpg' }] })),
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: false, assets: [{ uri: 'file://test.jpg' }] })),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Global mocks for React Navigation
// Include any navigation related mocks needed for your tests
global.mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

global.mockRoute = {
  params: {},
};

// Handle platform-specific modules
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: obj => obj.android || obj.default,
}));

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific React Native warnings in test output
  if (
    args[0].includes('Warning:') &&
    (args[0].includes('componentWillReceiveProps') ||
      args[0].includes('componentWillMount'))
  ) {
    return;
  }
  originalConsoleError(...args);
};