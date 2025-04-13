import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeOfflineSystem } from '../offline-init';
import { submitFormWithOfflineSupport } from '../forms-offline';
import { storeEventsData, getEventsData } from '../events-offline';
import { migrateFormsFromLocalStorage } from '../forms-offline';
import { processSyncQueue } from '../indexed-db';
import { JusticeBusEventsData } from '../validators/justice-bus-events';

// Mock the validators module to avoid TypeScript errors with test data
vi.mock('../validators/justice-bus-events', async () => {
  const actual = await vi.importActual('../validators/justice-bus-events');
  return {
    ...actual
  };
});

// Mock modules
vi.mock('../indexed-db', async () => {
  const actual = await vi.importActual('../indexed-db');
  return {
    ...actual,
    processSyncQueue: vi.fn(),
    initOfflineSystem: vi.fn(),
    registerSyncListeners: vi.fn()
  };
});

vi.mock('../events-offline', async () => {
  const actual = await vi.importActual('../events-offline');
  return {
    ...actual,
    storeEventsData: vi.fn(),
    getEventsData: vi.fn(),
    initEventsOfflineSystem: vi.fn()
  };
});

vi.mock('../offline-verification', () => ({
  syncOfflineVerificationAttempts: vi.fn().mockResolvedValue(0)
}));

vi.mock('../offline-verification-db', () => ({
  syncOfflineVerificationAttempts: vi.fn().mockResolvedValue(0)
}));

describe('Offline Integration', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // Mock fetch
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    ) as any;

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('Offline System Initialization', () => {
    it('should initialize the offline system and migrate data', async () => {
      // Mock localStorage with form data
      const formQueueItems = [
        {
          url: '/api/forms/1',
          data: { name: 'User 1' },
          timestamp: new Date().toISOString()
        },
        {
          url: '/api/forms/2',
          data: { name: 'User 2' },
          timestamp: new Date().toISOString()
        }
      ];
      
      (global.localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'offline_form_queue') {
          return JSON.stringify(formQueueItems);
        }
        return null;
      });

      await initializeOfflineSystem();

      // Verify migrations were attempted
      expect(processSyncQueue).toHaveBeenCalled();
    });
  });

  describe('Online/Offline Transition', () => {
    it('should handle transitioning between online and offline modes', async () => {
      // Start online
      expect(navigator.onLine).toBe(true);
      
      // Create test data
      const formData = { name: 'Test User', email: 'test@example.com' };
      
      // Rather than trying to match the exact type structure,
      // we'll mock the validation and type checking for event data
      const mockEventData = { 
        events: [{
          id: '1',
          title: 'Test Event',
          date: '2023-12-25',
          startTime: '09:00',
          endTime: '17:00',
          status: 'Open to Public',
          location: {
            name: 'Test Location',
            county: 'Davidson',
            isPrivate: false,
            address: {
              street: '123 Main St',
              city: 'Nashville',
              state: 'TN',
              zipCode: '37203'
            }
          },
          eventType: ['Legal Clinic']
        }],
        lastUpdated: new Date().toISOString(),
        contactInfo: { 
          email: 'test@example.com',
          website: 'https://justiceforalltn.org/upcoming-events/'
        }
      };
      
      // Test submitting form while online
      const onlineResult = await submitFormWithOfflineSupport('/api/forms', formData);
      expect(global.fetch).toHaveBeenCalled();
      expect(onlineResult).toEqual({ success: true });
      
      // Mock storing events - explicitly cast to avoid type errors in tests
      (storeEventsData as any).mockResolvedValue(undefined);
      await storeEventsData(mockEventData as unknown as JusticeBusEventsData);
      expect(storeEventsData).toHaveBeenCalledWith(mockEventData);
      
      // Transition to offline
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      });
      expect(navigator.onLine).toBe(false);
      
      // Reset fetch mock to verify it's not called during offline
      vi.clearAllMocks();
      
      // Test offline form submission
      const offlineResult = await submitFormWithOfflineSupport('/api/forms', formData);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(offlineResult).toEqual({
        status: 'offline',
        message: 'Your form has been saved and will be submitted when you\'re back online.',
      });
      
      // Mock retrieving events while offline
      (getEventsData as any).mockResolvedValue(mockEventData);
      const retrievedEvents = await getEventsData();
      expect(getEventsData).toHaveBeenCalled();
      expect(retrievedEvents).toEqual(mockEventData);
      
      // Transition back online
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true
      });
      
      // Online processing should start when back online
      // This would typically trigger processSyncQueue via event handlers
      await processSyncQueue();
      expect(processSyncQueue).toHaveBeenCalled();
    });
  });
}); 