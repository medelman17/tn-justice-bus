import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storeFormData, submitFormWithOfflineSupport, migrateFormsFromLocalStorage } from '../forms-offline';
import * as indexedDb from '../indexed-db';

// Mock the indexed-db module
vi.mock('../indexed-db', () => ({
  STORES: {
    FORMS: 'forms',
    SYNC_QUEUE: 'sync-queue'
  },
  queueSync: vi.fn().mockResolvedValue(undefined),
  storeData: vi.fn().mockResolvedValue(undefined),
  getData: vi.fn().mockResolvedValue(null),
  getAllData: vi.fn().mockResolvedValue([]),
  deleteData: vi.fn().mockResolvedValue(undefined)
}));

describe('Forms Offline Utilities', () => {
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

    // Mock fetch for online submissions
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    ) as any;

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('storeFormData', () => {
    it('should store form data using queueSync', async () => {
      const formData = { name: 'Test User', email: 'test@example.com' };
      await storeFormData('/api/forms', formData);
      
      expect(indexedDb.queueSync).toHaveBeenCalledWith('forms', formData, '/api/forms');
    });

    it('should throw an error if queueSync fails', async () => {
      const error = new Error('Failed to queue sync');
      (indexedDb.queueSync as any).mockRejectedValueOnce(error);

      const formData = { name: 'Test User', email: 'test@example.com' };
      
      await expect(storeFormData('/api/forms', formData)).rejects.toThrow('Failed to queue sync');
    });
  });

  describe('submitFormWithOfflineSupport', () => {
    it('should submit form data directly when online', async () => {
      const formData = { name: 'Test User', email: 'test@example.com' };
      
      const result = await submitFormWithOfflineSupport('/api/forms', formData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      expect(result).toEqual({ success: true });
    });

    it('should store form data offline when not online', async () => {
      // Set navigator.onLine to false
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      });

      const formData = { name: 'Test User', email: 'test@example.com' };
      
      const result = await submitFormWithOfflineSupport('/api/forms', formData);
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(indexedDb.queueSync).toHaveBeenCalledWith('forms', formData, '/api/forms');
      
      expect(result).toEqual({
        status: 'offline',
        message: 'Your form has been saved and will be submitted when you\'re back online.',
      });
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      global.fetch = vi.fn().mockRejectedValueOnce(error);

      const formData = { name: 'Test User', email: 'test@example.com' };
      
      await expect(submitFormWithOfflineSupport('/api/forms', formData)).rejects.toThrow('Network error');
    });
  });

  describe('migrateFormsFromLocalStorage', () => {
    it('should migrate forms from localStorage to IndexedDB', async () => {
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
      
      (global.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(formQueueItems));
      
      const result = await migrateFormsFromLocalStorage();
      
      expect(result).toBe(true);
      expect(global.localStorage.getItem).toHaveBeenCalledWith('offline_form_queue');
      expect(indexedDb.queueSync).toHaveBeenCalledTimes(2);
      
      // Verify each form was queued
      expect(indexedDb.queueSync).toHaveBeenCalledWith('forms', formQueueItems[0].data, formQueueItems[0].url);
      expect(indexedDb.queueSync).toHaveBeenCalledWith('forms', formQueueItems[1].data, formQueueItems[1].url);
    });

    it('should handle empty localStorage', async () => {
      (global.localStorage.getItem as any).mockReturnValueOnce(null);
      
      const result = await migrateFormsFromLocalStorage();
      
      expect(result).toBe(false);
      expect(indexedDb.queueSync).not.toHaveBeenCalled();
    });

    it('should handle localStorage parsing errors', async () => {
      (global.localStorage.getItem as any).mockReturnValueOnce('invalid json');
      
      const result = await migrateFormsFromLocalStorage();
      
      expect(result).toBe(false);
      expect(indexedDb.queueSync).not.toHaveBeenCalled();
    });
  });
}); 