/**
 * IndexedDB-based offline verification utilities for Tennessee Justice Bus app
 * Handles verification code attempts when offline
 */

import { signIn } from "next-auth/react";
import { STORES, storeData, getAllData, deleteData } from "./indexed-db";

// Store name for verification attempts
const VERIFICATION_STORE = "verifications";

// Expiration time for verification attempts
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Verification attempt type
interface VerificationAttempt {
  id: string;
  phone: string;
  code: string;
  timestamp: number;
}

/**
 * Store a verification attempt for later synchronization when offline
 *
 * @param phone The phone number being verified
 * @param code The verification code entered
 * @returns Success status
 */
export async function storeOfflineVerificationAttempt(
  phone: string,
  code: string
): Promise<boolean> {
  try {
    // Check if we're running on the client
    if (typeof window === "undefined") {
      return false;
    }

    const attempt: VerificationAttempt = {
      id: `${phone}_${Date.now()}`,
      phone,
      code,
      timestamp: Date.now(),
    };

    // Store in IndexedDB
    await storeData<VerificationAttempt>(VERIFICATION_STORE, attempt);

    return true;
  } catch (error) {
    console.error("Failed to store offline verification attempt:", error);
    
    // Fallback to legacy localStorage method
    try {
      const storageKey = `offline_verification_${phone}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          phone,
          code,
          timestamp: Date.now(),
        })
      );
      return true;
    } catch (fallbackError) {
      console.error("Failed to store offline verification in localStorage:", fallbackError);
      return false;
    }
  }
}

/**
 * Process all offline verification attempts when back online
 * Attempts to verify each stored attempt and removes them from storage
 *
 * @returns Number of processed attempts
 */
export async function syncOfflineVerificationAttempts(): Promise<number> {
  try {
    // Check if we're running on the client
    if (typeof window === "undefined") {
      return 0;
    }

    let processedCount = 0;

    // Get all verification attempts from IndexedDB
    const attempts = await getAllData<VerificationAttempt>(VERIFICATION_STORE);

    // Process each attempt
    for (const attempt of attempts) {
      try {
        // Skip if older than expiration time (for security)
        if (Date.now() - attempt.timestamp > EXPIRATION_TIME) {
          await deleteData(VERIFICATION_STORE, attempt.id);
          continue;
        }

        // Attempt to verify online
        await signIn("credentials", {
          phone: attempt.phone,
          code: attempt.code,
          redirect: false,
        });

        // Remove from storage regardless of outcome
        await deleteData(VERIFICATION_STORE, attempt.id);
        processedCount++;
      } catch (error) {
        console.error("Failed to process offline verification:", error);
      }
    }

    return processedCount;
  } catch (error) {
    console.error("Error synchronizing offline verifications:", error);
    return 0;
  }
}

/**
 * Check if there are any pending offline verification attempts
 *
 * @returns True if there are pending attempts
 */
export async function hasPendingOfflineVerifications(): Promise<boolean> {
  try {
    // Check if we're running on the client
    if (typeof window === "undefined") {
      return false;
    }

    // Get all verification attempts
    const attempts = await getAllData<VerificationAttempt>(VERIFICATION_STORE);
    
    // Remove expired attempts
    const validAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.timestamp <= EXPIRATION_TIME
    );
    
    return validAttempts.length > 0;
  } catch (error) {
    console.error("Error checking for pending offline verifications:", error);
    return false;
  }
} 