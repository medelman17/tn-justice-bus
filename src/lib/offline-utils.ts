// Utilities for offline support
import { NotificationPayload, NotificationOptions } from "@/lib/knock";

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
    // If offline, store in IndexedDB as a backup (in addition to service worker handling)
    await storeFormDataLocally(url, data);

    // Return a response that indicates offline submission
    return {
      status: "offline",
      message:
        "Your form has been saved and will be submitted when you're back online.",
    };
  }
}

/**
 * Store form data in IndexedDB as a backup
 * @param url API endpoint
 * @param data Form data
 */
async function storeFormDataLocally(
  url: string,
  data: FormData
): Promise<void> {
  // This is a simplified implementation - in a real app, you'd use IndexedDB directly
  // or a library like localforage or Dexie

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

    console.log("Form data stored locally for offline use");
  } catch (error) {
    console.error("Error storing form data locally:", error);
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
    // Create queue data
    const queueData: NotificationQueueItem = {
      workflowKey,
      payload,
      options,
      timestamp: new Date().toISOString(),
    };

    // Get existing queue or create new one
    const queueString = localStorage.getItem("notification_queue") || "[]";
    const queue = JSON.parse(queueString);

    // Add new item to queue
    queue.push(queueData);

    // Store updated queue
    localStorage.setItem("notification_queue", JSON.stringify(queue));

    console.log(`Notification queued for later delivery: ${workflowKey}`);
  } catch (error) {
    console.error("Error queueing notification:", error);
  }
}

/**
 * Process offline form and notification queues when coming back online
 */
export function setupOfflineSync(): void {
  window.addEventListener("online", async () => {
    console.log("Back online, checking for pending form submissions...");

    // Process form submissions
    try {
      const formQueueString =
        localStorage.getItem("offline_form_queue") || "[]";
      const formQueue = JSON.parse(formQueueString);

      if (formQueue.length > 0) {
        console.log(
          `Found ${formQueue.length} pending form submissions to process`
        );

        // Process form queue
        const newFormQueue: FormQueueItem[] = [];
        for (const item of formQueue) {
          try {
            // Attempt to submit
            await fetch(item.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(item.data),
            });

            console.log(`Successfully submitted form to ${item.url}`);
          } catch (error) {
            console.error(`Failed to submit form to ${item.url}:`, error);
            // Keep failed submissions in the queue for next attempt
            newFormQueue.push(item);
          }
        }

        // Update form queue with only failed submissions
        localStorage.setItem(
          "offline_form_queue",
          JSON.stringify(newFormQueue)
        );

        if (newFormQueue.length === 0) {
          console.log("All pending form submissions processed successfully");
        } else {
          console.log(
            `${newFormQueue.length} form submissions failed and will be retried later`
          );
        }
      } else {
        console.log("No pending form submissions found");
      }
    } catch (error) {
      console.error("Error processing offline form queue:", error);
    }

    // Process notifications
    try {
      const notifQueueString =
        localStorage.getItem("notification_queue") || "[]";
      const notifQueue = JSON.parse(notifQueueString);

      if (notifQueue.length > 0) {
        console.log(
          `Found ${notifQueue.length} pending notifications to process`
        );

        // Process notification queue
        const newNotifQueue: NotificationQueueItem[] = [];
        for (const item of notifQueue) {
          try {
            // Attempt to submit via API route
            await fetch("/api/notifications/process-queued", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                workflowKey: item.workflowKey,
                payload: item.payload,
                options: item.options,
              }),
            });

            console.log(
              `Successfully processed notification: ${item.workflowKey}`
            );
          } catch (error) {
            console.error(
              `Failed to process notification ${item.workflowKey}:`,
              error
            );
            // Keep failed notifications in the queue for next attempt
            newNotifQueue.push(item);
          }
        }

        // Update notification queue with only failed ones
        localStorage.setItem(
          "notification_queue",
          JSON.stringify(newNotifQueue)
        );

        if (newNotifQueue.length === 0) {
          console.log("All pending notifications processed successfully");
        } else {
          console.log(
            `${newNotifQueue.length} notifications failed and will be retried later`
          );
        }
      } else {
        console.log("No pending notifications found");
      }
    } catch (error) {
      console.error("Error processing notification queue:", error);
    }
  });
}
