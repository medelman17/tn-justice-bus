/**
 * This file provides utility functions for handling form data in offline mode.
 * It leverages the generalized IndexedDB utilities to store form submissions
 * and ensures they are synchronized when the user comes back online.
 */
import {
  STORES,
  storeData,
  getData,
  getAllData,
  queueSync,
  migrateFromLocalStorage,
} from "./indexed-db";

// Type definitions
export interface FormData {
  [key: string]: unknown;
}

export interface FormQueueItem {
  id?: number;
  url: string;
  data: FormData;
  timestamp: string;
  synced: boolean;
}

// Local storage key for backward compatibility
const LOCAL_STORAGE_FORM_QUEUE = "offline_form_queue";

/**
 * Store form data in IndexedDB for offline access
 * @param url API endpoint
 * @param data Form data
 */
export async function storeFormData(
  url: string,
  data: FormData
): Promise<void> {
  try {
    // Create a form queue item
    const formItem: FormQueueItem = {
      url,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    // Queue the item for sync
    await queueSync<FormData>("forms", data, url);

    console.log("Form data stored in IndexedDB for offline use");
  } catch (error) {
    console.error("Error storing form data:", error);
    throw error;
  }
}

/**
 * Submit form with offline support
 * @param url API endpoint to submit to
 * @param data Form data
 * @returns Promise with API response or offline status
 */
export async function submitFormWithOfflineSupport<T>(
  url: string,
  data: FormData
): Promise<T | { status: "offline"; message: string }> {
  // Check if we're online
  if (navigator.onLine) {
    try {
      // If online, submit directly
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  } else {
    // If offline, store in IndexedDB
    await storeFormData(url, data);

    // Return a response that indicates offline submission
    return {
      status: "offline",
      message:
        "Your form has been saved and will be submitted when you're back online.",
    };
  }
}

/**
 * Migrate form data from localStorage to IndexedDB
 * This should be called during the app initialization phase
 */
export async function migrateFormsFromLocalStorage(): Promise<boolean> {
  try {
    // Get existing queue from localStorage
    const queueString = localStorage.getItem(LOCAL_STORAGE_FORM_QUEUE);
    
    if (!queueString) {
      return false; // No data to migrate
    }
    
    const forms = JSON.parse(queueString) as FormQueueItem[];
    
    // Process each form item and store in IndexedDB sync queue
    for (const form of forms) {
      await queueSync<FormData>(
        "forms",
        form.data,
        form.url
      );
    }
    
    // Optionally, clear localStorage after migration
    // Uncomment when ready to fully migrate:
    // localStorage.removeItem(LOCAL_STORAGE_FORM_QUEUE);
    
    console.log(`Migrated ${forms.length} form submissions from localStorage to IndexedDB`);
    return true;
  } catch (error) {
    console.error("Error migrating forms from localStorage:", error);
    return false;
  }
} 