# Knock Implementation Guide for SMS Notifications

## Overview

This guide documents the implementation of SMS notifications in the Tennessee Justice Bus application using Knock. This implementation is critical for efficiently communicating with clients in rural areas, particularly for delivering verification codes, appointment reminders, and case status updates.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation and Setup](#installation-and-setup)
3. [Core Concepts](#core-concepts)
4. [Configuration](#configuration)
5. [Workflow Creation](#workflow-creation)
6. [Integration Points](#integration-points)
7. [Offline Considerations](#offline-considerations)
8. [Testing and Debugging](#testing-and-debugging)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Resources](#resources)

## Introduction

The Tennessee Justice Bus application serves rural communities where reliable communication is essential, but internet connectivity may be limited. Our implementation of Knock for SMS notifications addresses several key needs:

- **Verification Codes**: Secure phone number verification during authentication
- **Appointment Reminders**: Timely notifications about upcoming Justice Bus visits
- **Case Status Updates**: Critical updates that clients need to know promptly
- **Document Reminders**: Notifications about required documentation for consultations

Using Knock's notification infrastructure provides several advantages:

- **Reliability**: Enterprise-grade delivery with provider fallbacks
- **Templating**: Consistent messaging with dynamic content
- **Preferences**: Respecting user communication preferences
- **Analytics**: Tracking delivery and engagement metrics
- **Compliance**: Managing opt-outs and regulatory requirements

## Installation and Setup

### Dependencies

```bash
# Install Knock SDK for Node.js
pnpm add @knocklabs/node
```

### Environment Variables

Add the following to your Vercel environment configuration:

```
KNOCK_API_KEY=your_secret_api_key
KNOCK_SIGNING_KEY=your_signing_key
```

These keys can be obtained from the Developers section of the Knock dashboard after creating an account at [dashboard.knock.app](https://dashboard.knock.app/).

### Integration Initialization

Create a Knock client utility in `src/lib/knock.ts`:

```typescript
import { Knock } from "@knocklabs/node";

// Initialize Knock client
let knockClient: Knock | null = null;

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
```

## Core Concepts

Understanding these key Knock concepts is essential for implementation:

### Workflows

Workflows define the notification journey:

- Each workflow represents a specific notification type (e.g., "verification-code", "appointment-reminder")
- Workflows contain steps that determine message content and delivery conditions
- They can include conditional logic, delays, and delivery preferences

### Recipients

Recipients are the users who will receive notifications:

- In our case, these are primarily clients of the Justice Bus program
- Each recipient needs a unique identifier (we use their user ID or phone number)
- Recipients can have channel-specific data (e.g., phone number for SMS)
- They can set preferences for how they receive different types of notifications

### Channels

Channels are the methods through which notifications are sent:

- We primarily use the SMS channel with Twilio as our provider
- Each channel has specific configuration requirements
- Message templates are defined per channel

## Configuration

### Knock Dashboard Setup

1. **Create a Knock Account**:

   - Sign up at [dashboard.knock.app/signup](https://dashboard.knock.app/signup)
   - Create a new environment for development

2. **Configure SMS Channel**:

   - Navigate to Integrations > SMS in the Knock dashboard
   - Select Twilio as the provider
   - Enter your Twilio credentials:
     - Account SID
     - Auth Token
     - From Number (obtained from Twilio)

3. **Set Default Properties**:
   - Configure default sender information
   - Set message footers (e.g., "Reply STOP to unsubscribe")
   - Configure retry settings

### Provider Selection

We selected Twilio as our SMS provider because:

- Extensive coverage in rural Tennessee areas
- Reliable delivery metrics
- Comprehensive delivery status reporting
- Compliance features for opt-out management

While Knock supports multiple SMS providers (MessageBird, Vonage, etc.), Twilio is our primary choice with Telnyx configured as a fallback option for redundancy.

## Workflow Creation

For our implementation, we'll create three essential workflows:

### 1. Verification Code Workflow

This workflow sends one-time verification codes during phone authentication:

1. In the Knock dashboard, create a new workflow named "verification-code"
2. Add an SMS channel step
3. Configure the message template:

```
Your Tennessee Justice Bus verification code is: {{code}}. This code will expire in 10 minutes.
```

4. Add a throttle function to prevent abuse (max 5 messages per 10 minutes)
5. Commit the workflow to your development environment

### 2. Appointment Reminder Workflow

This workflow sends reminders about upcoming Justice Bus visits:

1. Create a workflow named "appointment-reminder"
2. Add a delay function to time the notification (24 hours before appointment)
3. Add a branch function with conditions:
   - "reminder_type": "initial" → sends a detailed message
   - "reminder_type": "final" → sends a shorter message
4. Add an SMS channel step with template:

```
REMINDER: Your Justice Bus appointment is on {{appointment_date}} at {{appointment_time}} in {{location}}. Please bring: {{documents}}. Reply CONFIRM to confirm or CANCEL to cancel.
```

5. Commit the workflow

### 3. Status Update Workflow

This workflow notifies clients of case status changes:

1. Create a workflow named "case-status-update"
2. Add a branch function with conditions for different status types
3. Add an SMS channel step with template:

```
Update on your legal matter: {{status_message}}. {{next_steps}}
```

4. Commit the workflow

## Integration Points

### 1. Authentication System Integration

Modify the phone verification code function in `src/app/api/auth/verify-phone/route.ts`:

```typescript
import { getKnockClient } from "@/lib/knock";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { phone } = data;

    // Generate verification code
    const code = generateVerificationCode();

    // Store code in database with expiration
    await storeVerificationCode(phone, code);

    // Send via Knock
    const knock = getKnockClient();
    await knock.workflows.trigger("verification-code", {
      recipients: [
        {
          id: phone, // Using phone as ID for new users
          phone_number: phone,
        },
      ],
      data: {
        code: code,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Verification code error:", error);
    return Response.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
```

### 2. Appointment System Integration

Integrate Knock with the appointment scheduling system:

```typescript
import { getKnockClient } from "@/lib/knock";
import { format } from "date-fns";

export async function scheduleAppointment(
  appointmentData: AppointmentData,
  userId: string
) {
  try {
    // Save appointment to database
    const appointment = await db.appointments.create({
      data: {
        userId,
        location: appointmentData.location,
        date: appointmentData.date,
        type: appointmentData.type,
        // ...other fields
      },
    });

    // Calculate reminder time (24 hours before appointment)
    const reminderTime = new Date(appointment.date);
    reminderTime.setHours(reminderTime.getHours() - 24);

    // Format required documents as a list
    const documentsList = appointmentData.requiredDocuments.join(", ");

    // Schedule reminder notification
    const knock = getKnockClient();
    await knock.workflows.trigger("appointment-reminder", {
      recipients: [userId],
      data: {
        appointment_date: format(appointment.date, "MMMM d, yyyy"),
        appointment_time: format(appointment.date, "h:mm a"),
        location: appointment.location,
        documents: documentsList,
        reminder_type: "initial",
      },
      scheduled_at: reminderTime.toISOString(),
    });

    return appointment;
  } catch (error) {
    console.error("Appointment scheduling error:", error);
    throw error;
  }
}
```

### 3. User Identification and Management

Implement proper user identification to ensure consistent notification delivery:

```typescript
import { getKnockClient } from "@/lib/knock";

export async function identifyUserToKnock(user: User) {
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
```

### 4. Case Status Update Integration

Implement notifications for case status changes:

```typescript
import { getKnockClient } from "@/lib/knock";

export async function updateCaseStatus(
  caseId: string,
  newStatus: string,
  userId: string
) {
  try {
    // Update case in database
    const updatedCase = await db.cases.update({
      where: { id: caseId },
      data: { status: newStatus },
    });

    // Determine next steps based on status
    let nextSteps = "";
    let statusMessage = "";

    switch (newStatus) {
      case "documents_requested":
        statusMessage = "Your attorney has requested additional documents";
        nextSteps =
          "Please upload the requested documents through the Justice Bus app within 5 days.";
        break;
      case "appointment_scheduled":
        statusMessage = "Your consultation has been scheduled";
        nextSteps = `Please prepare to meet at ${updatedCase.location} on ${format(updatedCase.appointmentDate, "MMMM d")}`;
        break;
      // Other status types...
    }

    // Send notification
    const knock = getKnockClient();
    await knock.workflows.trigger("case-status-update", {
      recipients: [userId],
      data: {
        status_message: statusMessage,
        next_steps: nextSteps,
        case_id: caseId,
        case_type: updatedCase.type,
      },
    });

    return updatedCase;
  } catch (error) {
    console.error("Case status update error:", error);
    throw error;
  }
}
```

## Offline Considerations

Since our application targets rural areas with connectivity challenges, we must implement strategies to handle notification requests reliably:

### 1. Client-Side Notification Queue

Create a utility in `src/lib/offline-utils.ts` to queue notification requests when offline:

```typescript
import { openDB } from "idb";

const NOTIFICATION_QUEUE_NAME = "notification-queue";

/**
 * Queue a notification request when offline
 */
export async function queueNotification(workflowKey: string, payload: any) {
  try {
    const db = await openDB("tn-justice-bus-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(NOTIFICATION_QUEUE_NAME)) {
          db.createObjectStore(NOTIFICATION_QUEUE_NAME, {
            autoIncrement: true,
          });
        }
      },
    });

    await db.add(NOTIFICATION_QUEUE_NAME, {
      workflowKey,
      payload,
      timestamp: new Date().toISOString(),
    });

    console.log("Notification queued for offline processing");
  } catch (error) {
    console.error("Error queuing notification:", error);
  }
}

/**
 * Process notification queue when back online
 */
export async function processNotificationQueue() {
  try {
    const db = await openDB("tn-justice-bus-db", 1);

    // Only proceed if we have a network connection
    if (!navigator.onLine) return;

    const tx = db.transaction(NOTIFICATION_QUEUE_NAME, "readwrite");
    const store = tx.objectStore(NOTIFICATION_QUEUE_NAME);

    let cursor = await store.openCursor();

    while (cursor) {
      const { workflowKey, payload } = cursor.value;

      try {
        // Send notification via API route to ensure proper server-side processing
        const response = await fetch("/api/notifications/process-queued", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflowKey,
            payload,
          }),
        });

        if (response.ok) {
          // Delete successful item from queue
          await cursor.delete();
        } else {
          console.error("Failed to process queued notification");
        }
      } catch (error) {
        console.error("Error processing queued notification:", error);
      }

      cursor = await cursor.continue();
    }

    await tx.done;
  } catch (error) {
    console.error("Error processing notification queue:", error);
  }
}

// Set up event listener for when we come back online
export function setupNotificationSync() {
  window.addEventListener("online", () => {
    processNotificationQueue();
  });
}
```

### 2. Server-Side API Route

Create an API route to process queued notifications in `src/app/api/notifications/process-queued/route.ts`:

```typescript
import { getKnockClient } from "@/lib/knock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth";

export async function POST(request: Request) {
  try {
    // Verify authenticated user
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowKey, payload } = await request.json();

    // Process the notification
    const knock = getKnockClient();
    await knock.workflows.trigger(workflowKey, payload);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing queued notification:", error);
    return Response.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
```

### 3. Initialization in Layout

Initialize the notification sync in `src/app/layout.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { setupNotificationSync } from "@/lib/offline-utils";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up notification sync for offline recovery
    setupNotificationSync();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Testing and Debugging

### Testing Notifications

1. **Development Testing**:

   - Use the Knock dashboard's "Sandbox" feature to test workflows
   - Set up test phone numbers for each developer
   - Create test environments in Knock to separate testing from production

2. **Manual Test Process**:

   - Test verification code delivery and timeouts
   - Test appointment reminders with different data variables
   - Test status updates for all case types
   - Test preference management and opt-outs

3. **Simulating Offline Scenarios**:
   - Use Chrome DevTools Network tab to simulate offline conditions
   - Queue notifications while offline
   - Verify they process correctly when coming back online

### Common Issues and Solutions

1. **Failed Deliveries**:

   - Check Knock logs for delivery failures
   - Verify phone number format (include country code: +1XXXXXXXXXX)
   - Check that Twilio account has sufficient credits

2. **Template Rendering Issues**:

   - Preview templates in Knock dashboard before sending
   - Verify all variables are being passed correctly
   - Check for template syntax errors in the Knock dashboard

3. **Rate Limiting**:
   - Be aware of Twilio's rate limits
   - Implement proper throttling in sensitive workflows
   - Monitor for unexpected spikes in notification volume

## Monitoring and Maintenance

### Monitoring

1. **Delivery Analytics**:

   - Use Knock's built-in analytics to track:
     - Delivery rates
     - Engagement metrics
     - Error patterns
   - Review metrics weekly during early implementation

2. **Error Tracking**:
   - Implement proper error logging for all Knock-related functions
   - Set up Sentry or similar error tracking for notification failures
   - Create alerts for critical notification failures

### Maintenance

1. **Template Updates**:

   - Follow a review process for template changes
   - Test all template updates before committing to production
   - Document all templates in a central location

2. **Service Provider Management**:

   - Regularly review Twilio account status and billing
   - Set up alerts for low credit balances
   - Consider implementing a provider fallback strategy

3. **Compliance**:
   - Keep records of user opt-ins and opt-outs
   - Ensure compliance with SMS regulations
   - Include required opt-out instructions in templates

## Resources

- [Knock Documentation](https://docs.knock.app/)
- [Knock SMS Integration Guide](https://docs.knock.app/integrations/sms/overview)
- [Knock Node.js SDK](https://docs.knock.app/sdks/javascript/overview)
- [Twilio SMS Best Practices](https://www.twilio.com/docs/sms/tutorials/best-practices-for-sms)

## Mastra Agent Integration

The Knock notification system has been integrated with the Mastra AI agent framework to enable agent-triggered notifications across the intake workflow. This integration allows the conversational AI agent to notify users about document requirements, status updates, and attorney referrals.

### Agent-Triggered Notifications

The Mastra agent can trigger notifications through a custom tool implementation:

```typescript
// src/mastra/tools/notification-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { triggerNotification } from "../../lib/knock";

export const notificationTool = createTool({
  id: "send-notification",
  description: "Send notification to client or attorney",
  inputSchema: z.object({
    recipientId: z.string().describe("User ID of the recipient"),
    notificationType: z.enum([
      "appointment-reminder",
      "document-request",
      "status-update",
      "attorney-referral",
    ]),
    message: z.string().describe("Custom message content"),
    priority: z.enum(["normal", "urgent"]).default("normal"),
  }),
  execute: async ({ recipientId, notificationType, message, priority }) => {
    // Convert to our Knock workflow identifier
    const workflowKey = `intake-${notificationType}`;

    try {
      const result = await triggerNotification({
        userId: recipientId,
        workflowKey,
        data: {
          message,
          priority,
          source: "mastra-agent",
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        notificationId: result.id,
      };
    } catch (error) {
      // Handle offline case - queue for later
      if (!navigator.onLine) {
        // Add to our existing offline queue system
        await queueOfflineNotification({
          userId: recipientId,
          workflowKey,
          data: { message, priority, source: "mastra-agent" },
        });

        return {
          success: true,
          queued: true,
          message: "Notification queued for delivery when online",
        };
      }

      throw error;
    }
  },
});
```

### Mastra-Specific Notification Workflows

The following Knock workflows have been added specifically for the Mastra integration:

1. **Document Request Notification** (`intake-document-request`)

   - Triggered when the agent determines specific documents are needed
   - Message content specifies document types and reasoning
   - Can include document submission instructions and links

2. **Status Update Notification** (`intake-status-update`)

   - Communicates intake progress and next steps
   - Used for long-running intake processes that span multiple sessions
   - Provides clear context on where the client left off

3. **Attorney Referral Notification** (`intake-attorney-referral`)
   - Triggered when a case is flagged for urgent attorney review
   - Sent to both client and available attorneys
   - Includes case summary and urgency level

### Cost Considerations for Agent-Triggered Notifications

Given our focus on cost optimization, the following guardrails are in place for Mastra-triggered notifications:

1. **Rate Limiting**

   - Maximum of 5 automated notifications per client per day
   - Cooldown period of 2 hours between similar notification types
   - Priority-based bypass for urgent notifications

2. **Message Templating**

   - Standardized templates to ensure consistent messaging
   - Parameterized content to minimize redundancy
   - Pre-approved language for common scenarios

3. **Notification Batching**

   - Grouping of related notifications when possible
   - Digest mode for non-urgent updates
   - Scheduled delivery windows to minimize interruptions

4. **Manual Override**
   - Attorney review required for high-volume notification patterns
   - Circuit breaker for unexpected notification spikes
   - Opt-out capabilities for clients

---

This guide is maintained by the Tennessee Justice Bus development team. Last updated: April 12, 2025.
