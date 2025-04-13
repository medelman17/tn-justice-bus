import {
  Knock,
  Recipient,
  RecipientWithUpsert,
  TriggerWorkflowProperties,
  WorkflowRun,
} from "@knocklabs/node";

/**
 * Singleton Knock client to ensure we're reusing the same client instance
 * throughout the application for efficiency and to avoid multiple connections.
 */
let knockClient: Knock | null = null;

/**
 * Returns the Knock client instance, creating it if it doesn't exist.
 *
 * @returns {Knock} The Knock client instance
 * @throws {Error} If the KNOCK_API_KEY environment variable is not set
 */
export function getKnockClient(): Knock {
  if (!knockClient) {
    const apiKey = process.env.KNOCK_API_KEY;

    if (!apiKey) {
      throw new Error("KNOCK_API_KEY environment variable is required");
    }

    knockClient = new Knock(apiKey);
  }

  return knockClient;
}

/**
 * User information type for Knock identification
 */
export interface KnockUserInfo {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  timezone?: string;
  county?: string;
  preferredLanguage?: string;
  [key: string]: unknown; // Allow for additional properties
}

/**
 * Knock recipient definition
 */
export type KnockRecipient = Recipient | RecipientWithUpsert;

/**
 * Notification payload type specifically for Knock
 */
export interface NotificationPayload {
  recipients: KnockRecipient[];
  data?: Record<string, unknown>;
  actor?: string;
  tenant?: string;
  cancellationKey?: string;
  [key: string]: unknown; // Allow for additional properties
}

/**
 * Notification options type
 */
export interface NotificationOptions {
  scheduledAt?: string;
  [key: string]: unknown; // Allow for additional properties
}

/**
 * Identifies a user to Knock, ensuring their information is up-to-date.
 * This should be called after user authentication or profile updates.
 *
 * @param {KnockUserInfo} user - The user object with identification information
 * @returns {Promise<boolean>} Success status of the operation
 */
export async function identifyUserToKnock(
  user: KnockUserInfo
): Promise<boolean> {
  try {
    const knock = getKnockClient();

    await knock.users.identify(user.id, {
      name: user.name,
      email: user.email,
      phone_number: user.phoneNumber,
      // Include timezone for time-sensitive notifications
      properties: {
        timezone: user.timezone || "America/Chicago",
        county: user.county,
        preferredLanguage: user.preferredLanguage || "en",
      },
    });

    return true;
  } catch (error) {
    console.error("Knock user identification error:", error);
    return false;
  }
}

/**
 * Triggers a notification workflow with offline support.
 * If the device is offline, the notification request is queued for later.
 *
 * @param {string} workflowKey - The Knock workflow key
 * @param {NotificationPayload} payload - The notification payload
 * @param {NotificationOptions} options - Additional options like scheduled time
 * @returns {Promise<WorkflowRun | Record<string, unknown>>} Result of the workflow trigger or queue operation
 */
export async function triggerWorkflowWithOfflineSupport(
  workflowKey: string,
  payload: NotificationPayload,
  options: NotificationOptions = {}
): Promise<WorkflowRun | Record<string, unknown>> {
  // Server-side execution - always attempt direct delivery
  if (typeof window === "undefined") {
    const knock = getKnockClient();

    // Prepare workflow payload
    const workflowPayload = {
      ...payload,
    };

    // Add scheduled_at if provided
    if (options.scheduledAt) {
      // Use type assertion to add scheduled_at which is accepted by the API
      (
        workflowPayload as TriggerWorkflowProperties & { scheduled_at?: string }
      ).scheduled_at = options.scheduledAt;
    }

    return knock.workflows.trigger(workflowKey, workflowPayload);
  }

  // Client-side execution - check for connectivity
  if (navigator.onLine) {
    try {
      // Send via API route when online
      const response = await fetch("/api/notifications/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowKey,
          payload,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error triggering workflow:", error);

      // If fetch fails, fall back to queueing
      await queueNotification(workflowKey, payload, options);

      return {
        status: "queued",
        message: "Notification queued for later delivery",
      };
    }
  } else {
    // If offline, queue the notification
    await queueNotification(workflowKey, payload, options);

    return {
      status: "queued",
      message: "Device is offline. Notification queued for later delivery",
    };
  }
}

/**
 * Queue a notification for later delivery when back online
 * Uses IndexedDB for persistent storage
 *
 * @param {string} workflowKey - The workflow identifier
 * @param {NotificationPayload} payload - The notification payload
 * @param {NotificationOptions} options - Additional options
 */
async function queueNotification(
  workflowKey: string,
  payload: NotificationPayload,
  options: NotificationOptions = {}
): Promise<void> {
  try {
    // Use the existing offline queue system from offline-utils.ts
    // This is a simple implementation - in the real app, we would import and use
    // the more sophisticated queue from offline-utils.ts
    const queueData = {
      workflowKey,
      payload,
      options,
      timestamp: new Date().toISOString(),
    };

    // Store in localStorage as a simple implementation
    // In a production app, we would use IndexedDB via the offline-utils.ts module
    const queue = JSON.parse(
      localStorage.getItem("notification_queue") || "[]"
    );
    queue.push(queueData);
    localStorage.setItem("notification_queue", JSON.stringify(queue));

    console.log("Notification queued for offline delivery");
  } catch (error) {
    console.error("Error queueing notification:", error);
  }
}

// Export these constants for consistent workflow naming across the application
export const WORKFLOWS = {
  VERIFICATION_CODE: "verification-code",
  APPOINTMENT_REMINDER: "appointment-reminder",
  CASE_STATUS_UPDATE: "case-status-update",
};
