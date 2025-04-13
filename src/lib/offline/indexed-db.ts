/**
 * This file provides generalized utility functions for working with IndexedDB.
 * It serves as a foundation for all offline-capable data stores in the application.
 */

const DB_NAME = "justice-bus-offline";
const DB_VERSION = 1;

// List of all stores in the database
export const STORES = {
  EVENTS: "events",
  FORMS: "forms",
  CASES: "cases",
  NOTIFICATIONS: "notifications",
  VERIFICATIONS: "verifications",
  SYNC_QUEUE: "sync-queue"
};

// Store configuration type
export type StoreConfig = {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indices?: Array<{
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }>;
};

// Sync queue item type
export interface SyncQueueItem<T> {
  id?: number;
  storeType: string;
  data: T;
  timestamp: string;
  synced: boolean;
  apiPath: string;
  method: string;
}

// Store configurations
const storeConfigs: StoreConfig[] = [
  { name: STORES.EVENTS, keyPath: "id" },
  { name: STORES.FORMS, keyPath: "id" },
  { name: STORES.CASES, keyPath: "id" },
  { name: STORES.NOTIFICATIONS, keyPath: "id", autoIncrement: true },
  { name: STORES.VERIFICATIONS, keyPath: "id" },
  { name: STORES.SYNC_QUEUE, keyPath: "id", autoIncrement: true }
];

/**
 * Open the IndexedDB database with all required stores
 */
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error("Failed to open IndexedDB"));

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create stores based on configurations
      storeConfigs.forEach(config => {
        if (!db.objectStoreNames.contains(config.name)) {
          const store = db.createObjectStore(config.name, { 
            keyPath: config.keyPath,
            autoIncrement: config.autoIncrement 
          });
          
          // Create any indices if defined
          if (config.indices) {
            config.indices.forEach(index => {
              store.createIndex(index.name, index.keyPath, index.options);
            });
          }
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Store data in an IndexedDB store
 */
export async function storeData<T>(
  storeName: string,
  data: T,
  key?: string
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    // If key is provided, use it (for stores with standard IDs)
    const dataToStore = key ? { id: key, ...data } : data;
    await store.put(dataToStore);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`Failed to store data in ${storeName}`));
    });
  } catch (error) {
    console.error(`Error storing data in ${storeName}:`, error);
    throw error;
  }
}

/**
 * Retrieve data from an IndexedDB store by key
 */
export async function getData<T>(
  storeName: string,
  key: string | number
): Promise<T | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          if (typeof request.result.id !== 'undefined' && key === request.result.id) {
            // Remove the ID we added for storage if it matches the key
            const { id, ...data } = request.result;
            resolve(data as T);
          } else {
            resolve(request.result as T);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () =>
        reject(new Error(`Failed to retrieve data from ${storeName}`));
    });
  } catch (error) {
    console.error(`Error retrieving data from ${storeName}:`, error);
    return null;
  }
}

/**
 * Get all data from a store
 */
export async function getAllData<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      request.onerror = () =>
        reject(new Error(`Failed to retrieve all data from ${storeName}`));
    });
  } catch (error) {
    console.error(`Error retrieving all data from ${storeName}:`, error);
    return [];
  }
}

/**
 * Delete data from a store by key
 */
export async function deleteData(
  storeName: string,
  key: string | number
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to delete data from ${storeName}`));
    });
  } catch (error) {
    console.error(`Error deleting data from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Queue an update for syncing when online
 */
export async function queueSync<T>(
  storeType: string,
  data: T,
  apiPath: string,
  method = "POST"
): Promise<void> {
  try {
    const syncItem: SyncQueueItem<T> = {
      storeType,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      apiPath,
      method
    };

    const db = await openDatabase();
    const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite");
    const store = transaction.objectStore(STORES.SYNC_QUEUE);

    await store.put(syncItem);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error("Failed to queue sync update"));
    });
  } catch (error) {
    console.error("Error queuing sync update:", error);
    throw error;
  }
}

/**
 * Process the sync queue when coming online
 */
export async function processSyncQueue(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite");
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.getAll();

    request.onsuccess = async () => {
      const updates = request.result.filter((item) => !item.synced);

      for (const update of updates) {
        try {
          // Attempt to sync with the server
          const response = await fetch(update.apiPath, {
            method: update.method,
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
 * Initialize the offline system
 * This should be called when the app starts
 */
export function initOfflineSystem(): void {
  // Register sync listeners
  registerSyncListeners();

  // Process queue if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage(
  storeName: string,
  localStorageKey: string
): Promise<boolean> {
  try {
    const localData = localStorage.getItem(localStorageKey);
    
    if (!localData) {
      return false; // No data to migrate
    }
    
    const parsedData = JSON.parse(localData);
    
    // Store in IndexedDB
    await storeData(storeName, parsedData, "current");
    
    // Optionally, clear localStorage after migration
    // Uncomment when ready to fully migrate:
    // localStorage.removeItem(localStorageKey);
    
    return true;
  } catch (error) {
    console.error(`Error migrating ${localStorageKey} to IndexedDB:`, error);
    return false;
  }
} 