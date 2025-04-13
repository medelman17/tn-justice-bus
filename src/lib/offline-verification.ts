/**
 * Offline verification utilities for Tennessee Justice Bus app
 * Handles verification code attempts when offline
 */

import { signIn } from "next-auth/react";

const STORAGE_PREFIX = "offline_verification_";
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours for offline verification attempts

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

    const storageKey = `${STORAGE_PREFIX}${phone}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        phone,
        code,
        timestamp: Date.now(),
      })
    );

    return true;
  } catch (error) {
    console.error("Failed to store offline verification attempt:", error);
    return false;
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

    const keys = [];
    let processedCount = 0;

    // Find all offline verification attempts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }

    // Process each attempt
    for (const key of keys) {
      try {
        const dataString = localStorage.getItem(key);
        if (!dataString) continue;

        const data = JSON.parse(dataString);

        // Skip if older than expiration time (for security)
        if (Date.now() - data.timestamp > EXPIRATION_TIME) {
          localStorage.removeItem(key);
          continue;
        }

        // Attempt to verify online
        await signIn("credentials", {
          phone: data.phone,
          code: data.code,
          redirect: false,
        });

        // Remove from storage regardless of outcome
        localStorage.removeItem(key);
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
export function hasPendingOfflineVerifications(): boolean {
  try {
    // Check if we're running on the client
    if (typeof window === "undefined") {
      return false;
    }

    // Check for any keys with the verification prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking for pending offline verifications:", error);
    return false;
  }
}
