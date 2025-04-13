import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  storeOfflineVerificationAttempt,
  syncOfflineVerificationAttempts,
  hasPendingOfflineVerifications 
} from '../offline-verification-db';
import { signIn } from 'next-auth/react';
import * as indexedDb from '../indexed-db';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  signIn: vi.fn().mockResolvedValue({ ok: true })
}));

vi.mock('../indexed-db', () => ({
  STORES: {
    VERIFICATIONS: 'verifications'
  },
  storeData: vi.fn().mockResolvedValue(undefined),
  getAllData: vi.fn().mockResolvedValue([]),
  deleteData: vi.fn().mockResolvedValue(undefined)
}));

describe('Offline Verification IndexedDB', () => {
  beforeEach(() => {
    // Mock localStorage for fallback testing
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('storeOfflineVerificationAttempt', () => {
    it('should store a verification attempt in IndexedDB', async () => {
      const phone = '+12345678901';
      const code = '123456';
      
      const result = await storeOfflineVerificationAttempt(phone, code);
      
      expect(result).toBe(true);
      expect(indexedDb.storeData).toHaveBeenCalledWith(
        'verifications',
        expect.objectContaining({
          phone,
          code,
          timestamp: expect.any(Number)
        })
      );
    });

    it('should fallback to localStorage if IndexedDB fails', async () => {
      const phone = '+12345678901';
      const code = '123456';
      
      // Make IndexedDB fail
      (indexedDb.storeData as any).mockRejectedValueOnce(new Error('IndexedDB error'));
      
      const result = await storeOfflineVerificationAttempt(phone, code);
      
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        `offline_verification_${phone}`,
        expect.any(String)
      );
    });
  });

  describe('syncOfflineVerificationAttempts', () => {
    it('should process and delete verification attempts', async () => {
      // Mock stored verification attempts
      const now = Date.now();
      const mockAttempts = [
        { id: '1', phone: '+12345678901', code: '123456', timestamp: now },
        { id: '2', phone: '+10987654321', code: '654321', timestamp: now - 25 * 60 * 60 * 1000 } // Expired
      ];
      
      (indexedDb.getAllData as any).mockResolvedValueOnce(mockAttempts);
      
      const result = await syncOfflineVerificationAttempts();
      
      // Only one attempt should be processed (non-expired)
      expect(result).toBe(1);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('credentials', {
        phone: '+12345678901',
        code: '123456',
        redirect: false
      });
      
      // Both should be deleted
      expect(indexedDb.deleteData).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during sync process', async () => {
      const mockAttempts = [
        { id: '1', phone: '+12345678901', code: '123456', timestamp: Date.now() }
      ];
      
      (indexedDb.getAllData as any).mockResolvedValueOnce(mockAttempts);
      (signIn as any).mockRejectedValueOnce(new Error('Auth error'));
      
      const result = await syncOfflineVerificationAttempts();
      
      // Process should complete despite error
      expect(result).toBe(0);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(indexedDb.deleteData).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasPendingOfflineVerifications', () => {
    it('should return true when valid verification attempts exist', async () => {
      const mockAttempts = [
        { id: '1', phone: '+12345678901', code: '123456', timestamp: Date.now() }
      ];
      
      (indexedDb.getAllData as any).mockResolvedValueOnce(mockAttempts);
      
      const result = await hasPendingOfflineVerifications();
      
      expect(result).toBe(true);
    });

    it('should return false when no verification attempts exist', async () => {
      (indexedDb.getAllData as any).mockResolvedValueOnce([]);
      
      const result = await hasPendingOfflineVerifications();
      
      expect(result).toBe(false);
    });

    it('should filter out expired verification attempts', async () => {
      // Create one expired attempt
      const expired = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const mockAttempts = [
        { id: '1', phone: '+12345678901', code: '123456', timestamp: expired }
      ];
      
      (indexedDb.getAllData as any).mockResolvedValueOnce(mockAttempts);
      
      const result = await hasPendingOfflineVerifications();
      
      expect(result).toBe(false);
    });
  });
}); 