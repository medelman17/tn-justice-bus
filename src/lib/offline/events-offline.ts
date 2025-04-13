/**
 * This file provides utility functions for handling Justice Bus events data in offline mode.
 * It leverages IndexedDB for local storage and background sync for data synchronization.
 */
import { JusticeBusEventsData } from "../validators/justice-bus-events";

// IndexedDB database name and store
const DB_NAME = "justice-bus-offline";
const EVENTS_STORE = "events";
const SYNC_QUEUE_STORE = "sync-queue";

// Open the IndexedDB database
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(new Error("Failed to open IndexedDB"));

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        db.createObjectStore(EVENTS_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        db.createObjectStore(SYNC_QUEUE_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Store events data in IndexedDB for offline access
 */
export async function storeEventsData(
  data: JusticeBusEventsData
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(EVENTS_STORE, "readwrite");
    const store = transaction.objectStore(EVENTS_STORE);

    // Use a standard ID for the single events dataset
    await store.put({ id: "current", ...data });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error("Failed to store events data"));
    });
  } catch (error) {
    console.error("Error storing events data:", error);
    throw error;
  }
}

/**
 * Retrieve events data from IndexedDB
 */
export async function getEventsData(): Promise<JusticeBusEventsData | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(EVENTS_STORE, "readonly");
    const store = transaction.objectStore(EVENTS_STORE);
    const request = store.get("current");

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          // Remove the ID we added for storage
          const { id, ...data } = request.result;
          resolve(data as JusticeBusEventsData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () =>
        reject(new Error("Failed to retrieve events data"));
    });
  } catch (error) {
    console.error("Error retrieving events data:", error);
    return null;
  }
}

/**
 * Queue an event data update for syncing when online
 */
export async function queueEventsUpdate(
  data: JusticeBusEventsData
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SYNC_QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    await store.put({
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error("Failed to queue events update"));
    });
  } catch (error) {
    console.error("Error queuing events update:", error);
    throw error;
  }
}

/**
 * Process the sync queue when coming online
 */
export async function processSyncQueue(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SYNC_QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = async () => {
      const updates = request.result.filter((item) => !item.synced);

      for (const update of updates) {
        try {
          // Attempt to sync with the server
          const response = await fetch("/api/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(update.data),
          });

          if (response.ok) {
            // Mark as synced
            update.synced = true;
            await store.put(update);
          }
        } catch (error) {
          console.error("Failed to sync update:", error);
          // Leave as unsynced for next attempt
        }
      }
    };
  } catch (error) {
    console.error("Error processing sync queue:", error);
  }
}

/**
 * Register event listeners for background sync
 */
export function registerSyncListeners(): void {
  // Process queue when coming online
  window.addEventListener("online", () => {
    processSyncQueue();
  });

  // Also process on visibility change (user returns to app)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      processSyncQueue();
    }
  });
}

/**
 * Initialize the events offline system
 * This should be called when the app starts
 */
export function initEventsOfflineSystem(): void {
  // Register sync listeners
  registerSyncListeners();

  // Process queue if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}
