import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
}));

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock Cloudinary React Native
jest.mock('cloudinary-react-native', () => ({
  upload: jest.fn(() =>
    Promise.resolve({
      public_id: 'mock-public-id',
      secure_url: 'https://res.cloudinary.com/mock/image/upload/mock-public-id.jpg',
      width: 800,
      height: 600,
      format: 'jpg',
      bytes: 12345,
    })
  ),
}));

// Global test setup
global.fetch = jest.fn();

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
