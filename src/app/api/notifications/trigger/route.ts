import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import {
  getKnockClient,
  NotificationPayload,
  NotificationOptions,
} from "@/lib/knock";

/**
 * POST handler for triggering Knock notifications
 * This API route is used by the client-side to send notifications
 * with proper authentication through the server
 */
export async function POST(request: Request) {
  try {
    // Verify that the user is authenticated
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to send notifications." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { workflowKey, payload, options } = body;

    // Validate required fields
    if (!workflowKey) {
      return NextResponse.json(
        { error: "Workflow key is required" },
        { status: 400 }
      );
    }

    if (!payload || !payload.recipients || !payload.recipients.length) {
      return NextResponse.json(
        { error: "Recipients are required in the payload" },
        { status: 400 }
      );
    }

    // Get Knock client
    const knock = getKnockClient();

    // Prepare notification payload
    const notificationPayload: NotificationPayload = { ...payload };

    // Add scheduled_at if present in options
    if (options?.scheduledAt) {
      // Use type assertion for scheduled_at property
      (
        notificationPayload as NotificationPayload & { scheduled_at?: string }
      ).scheduled_at = options.scheduledAt;
    }

    // Trigger the workflow
    const result = await knock.workflows.trigger(
      workflowKey,
      notificationPayload
    );

    // Return success response
    return NextResponse.json({
      success: true,
      workflow: workflowKey,
      result,
    });
  } catch (error) {
    console.error("Error triggering notification:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to trigger notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
