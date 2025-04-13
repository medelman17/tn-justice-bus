import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getKnockClient } from "@/lib/knock";

/**
 * POST handler for processing queued notifications
 * This API route is used to process notifications that were queued
 * while the device was offline and are now being synced
 */
export async function POST(request: Request) {
  try {
    // Verify that the user is authenticated
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. You must be signed in to process notifications.",
        },
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
    const notificationPayload = { ...payload };

    // Add scheduled_at if present in options
    if (options?.scheduledAt) {
      // Use type assertion for scheduled_at property
      (
        notificationPayload as typeof notificationPayload & {
          scheduled_at?: string;
        }
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
      processed: true,
      result,
    });
  } catch (error) {
    console.error("Error processing queued notification:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to process queued notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
