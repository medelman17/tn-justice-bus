// Utilities for offline support
import { NotificationPayload, NotificationOptions } from "@/lib/knock";
import { syncOfflineVerificationAttempts } from "@/lib/offline/offline-verification";
import { submitFormWithOfflineSupport as submitFormWithIndexedDB } from "@/lib/offline/forms-offline";
import { queueSync, STORES } from "@/lib/offline/indexed-db";

// Type definitions
interface FormData {
  [key: string]: unknown;
}

interface FormQueueItem {
  url: string;
  data: FormData;
  timestamp: string;
}

interface NotificationQueueItem {
  workflowKey: string;
  payload: NotificationPayload;
  options: NotificationOptions;
  timestamp: string;
}

/**
 * Store authentication token for offline access
 * @param token JWT token to store
 */
export function storeAuthToken(token: string) {
  // Store in localStorage (for immediate use)
  localStorage.setItem("auth_token", token);

  // Also store in service worker cache (for offline access)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "STORE_AUTH_TOKEN",
      token,
    });
  }
}

/**
 * Retrieve auth token (works offline)
 * @returns Promise resolving to token string or null
 */
export async function getAuthToken(): Promise<string | null> {
  // Try localStorage first
  const token = localStorage.getItem("auth_token");
  if (token) return token;

  // If not in localStorage, try the service worker cache
  if ("caches" in window) {
    try {
      const cache = await caches.open("auth-tokens");
      const response = await cache.match("/auth-token");
      if (response) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Error retrieving token from cache:", error);
    }
  }

  return null;
}

/**
 * Check if user is currently online
 * @returns boolean
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Submit form with offline support
 * @param url API endpoint to submit to
 * @param data Form data
 * @returns Promise with API response or offline status
 * @deprecated Use the implementation from forms-offline.ts instead
 */
export async function submitFormWithOfflineSupport<T>(
  url: string,
  data: FormData
): Promise<T | { status: "offline"; message: string }> {
  // Use the new IndexedDB implementation
  return submitFormWithIndexedDB<T>(url, data);
}

/**
 * Store form data in IndexedDB as a backup
 * @param url API endpoint
 * @param data Form data
 * @deprecated Use the implementation from forms-offline.ts instead
 */
async function storeFormDataLocally(
  url: string,
  data: FormData
): Promise<void> {
  try {
    // Use the new IndexedDB implementation
    await queueSync<FormData>("forms", data, url);
    console.log("Form data stored in IndexedDB for offline use");
  } catch (error) {
    console.error("Error storing form data locally:", error);
    
    // Fallback to localStorage if IndexedDB fails
    try {
      // Get existing queue or create new one
      const queueString = localStorage.getItem("offline_form_queue") || "[]";
      const queue = JSON.parse(queueString);

      // Add new item to queue
      queue.push({
        url,
        data,
        timestamp: new Date().toISOString(),
      });

      // Store updated queue
      localStorage.setItem("offline_form_queue", JSON.stringify(queue));

      console.log("Form data stored in localStorage as fallback");
    } catch (localError) {
      console.error("Error storing form data in localStorage:", localError);
    }
  }
}

/**
 * Store a notification for later delivery when back online
 * @param workflowKey The workflow key
 * @param payload The notification payload
 * @param options The notification options
 */
export async function queueNotification(
  workflowKey: string,
  payload: NotificationPayload,
  options: NotificationOptions = {}
): Promise<void> {
  try {
    // Create notification data
    const notificationData = {
      workflowKey,
      payload,
      options,
      timestamp: new Date().toISOString(),
    };

    // Try to use IndexedDB first
    try {
      await queueSync<NotificationQueueItem>(
        "notifications", 
        notificationData,
        "/api/notifications",
        "POST"
      );
      console.log(`Notification queued in IndexedDB for later delivery: ${workflowKey}`);
      return;
    } catch (error) {
      console.error("Error storing notification in IndexedDB, falling back to localStorage:", error);
    }

    // Fallback to localStorage
    const queueString = localStorage.getItem("notification_queue") || "[]";
    const queue = JSON.parse(queueString);

    // Add new item to queue
    queue.push(notificationData);

    // Store updated queue
    localStorage.setItem("notification_queue", JSON.stringify(queue));

    console.log(`Notification queued in localStorage for later delivery: ${workflowKey}`);
  } catch (error) {
    console.error("Error queueing notification:", error);
  }
}

/**
 * Process offline form and notification queues when coming back online
 * @deprecated This is handled by the IndexedDB sync system
 */
export function setupOfflineSync(): void {
  console.warn("setupOfflineSync is deprecated. The IndexedDB system now handles this automatically.");
  
  // Keep for backward compatibility, but don't register new event listeners
  // All future sync will be handled by the IndexedDB system
}
