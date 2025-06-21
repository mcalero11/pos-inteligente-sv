import { vi } from 'vitest';

// Extend global types for testing
declare global {
  interface Window {
    __TAURI__: any;
  }
  var __TAURI__: any;
}

// Mock Tauri APIs
(globalThis as any).__TAURI__ = {
  tauri: {
    invoke: vi.fn(),
  },
};

// Mock the logger
vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the database service
vi.mock('../lib/database', () => ({
  databaseService: {
    getAllSystemSettings: vi.fn(),
    setSystemSetting: vi.fn(),
    getSystemSetting: vi.fn(),
  },
}));

// Setup DOM globals for jsdom
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}); 
