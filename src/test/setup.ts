import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { indexedDB } from 'fake-indexeddb';

// Set up global variables needed for IndexedDB
// Mock implementation for indexedDB if it doesn't exist
if (typeof globalThis.indexedDB === 'undefined') {
  console.log('Setting up IndexedDB for test environment');
  
  // Basic mock for IndexedDB API
  const mockIDBDatabase = {
    objectStoreNames: {
      contains: vi.fn().mockReturnValue(false)
    },
    createObjectStore: vi.fn().mockReturnValue({
      createIndex: vi.fn()
    }),
    transaction: vi.fn().mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        put: vi.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        }),
        get: vi.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        }),
        getAll: vi.fn().mockReturnValue({
          onsuccess: null,
          onerror: null
        })
      }),
      oncomplete: null,
      onerror: null
    })
  };

  // Mock IDBFactory with required properties
  const mockIndexedDB = {
    open: vi.fn().mockReturnValue({
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: mockIDBDatabase
    }),
    deleteDatabase: vi.fn().mockReturnValue({
      onsuccess: null,
      onerror: null
    }),
    cmp: vi.fn(),
    databases: vi.fn().mockResolvedValue([])
  } as unknown as IDBFactory;

  // Assign to global
  globalThis.indexedDB = mockIndexedDB;
}

// Add type definition for our test helpers
declare global {
  var setNetworkStatus: (online: boolean) => void;
  var indexedDB: IDBFactory;
}

// Reset mocks between tests
afterEach(() => {
  vi.restoreAllMocks();
});

// Setup for service worker tests
beforeAll(() => {
  // Register any global test setup needed
  vi.stubGlobal('fetch', vi.fn());
  
  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => true, // Default to online
  });
  
  // Helper to simulate online/offline status
  globalThis.setNetworkStatus = (online: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => online,
    });
    
    // Dispatch the appropriate event
    const event = new Event(online ? 'online' : 'offline');
    window.dispatchEvent(event);
  };

  // Mock fetch for all tests
  global.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    })
  ) as any;

  // Mock the navigator.onLine property
  Object.defineProperty(navigator, 'onLine', { 
    writable: true, 
    value: true 
  });
});

// Cleanup any global mocks after all tests
afterAll(() => {
  vi.unstubAllGlobals();
}); 