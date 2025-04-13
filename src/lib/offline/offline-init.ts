/**
 * This file manages the initialization of the offline system.
 * It handles migration from localStorage to IndexedDB and sets up
 * the common offline capabilities used across the application.
 */

import { initOfflineSystem } from "./indexed-db";
import { initEventsOfflineSystem } from "./events-offline";
import { migrateFormsFromLocalStorage } from "./forms-offline";
import { syncOfflineVerificationAttempts as syncVerificationsFromIndexedDB } from "./offline-verification-db";
import { syncOfflineVerificationAttempts as syncVerificationsFromLocalStorage } from "./offline-verification";

/**
 * Initialize the application's offline capabilities
 * This should be called during app initialization
 */
export async function initializeOfflineSystem(): Promise<void> {
  try {
    console.log("Initializing offline system...");
    
    // Initialize the base IndexedDB system
    initOfflineSystem();
    
    // Initialize the events offline system
    initEventsOfflineSystem();
    
    // Migrate data from localStorage to IndexedDB
    await migrateFormsFromLocalStorage();
    
    // Process any pending verification attempts from both storage systems
    // First, try the new IndexedDB system
    let processedCount = await syncVerificationsFromIndexedDB();
    
    // Then, try the legacy localStorage system as fallback
    if (processedCount === 0) {
      processedCount = await syncVerificationsFromLocalStorage();
    }
    
    if (processedCount > 0) {
      console.log(`Processed ${processedCount} offline verification attempts`);
    }

    console.log("Offline system initialization complete");
  } catch (error) {
    console.error("Error initializing offline system:", error);
  }
}

/**
 * Check if the application can function in offline mode
 */
export function canFunctionOffline(): boolean {
  // Check for IndexedDB support
  if (!window.indexedDB) {
    console.warn("IndexedDB is not supported - offline mode will be limited");
    return false;
  }

  return true;
} 