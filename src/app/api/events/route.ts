import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { justiceBusEvents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { justiceBusEventsSchema } from "@/lib/validators/justice-bus-events";

/**
 * GET /api/events
 * Retrieves the latest justice bus events data
 */
export async function GET() {
  try {
    // Get the latest record
    const result = await db
      .select()
      .from(justiceBusEvents)
      .orderBy(desc(justiceBusEvents.updatedAt))
      .limit(1);

    if (result.length === 0) {
      // Return empty default structure if no data
      return NextResponse.json({
        events: [],
        lastUpdated: new Date().toISOString(),
        contactInfo: {
          email: "justicebus@tncourts.gov",
          website: "https://justiceforalltn.org/upcoming-events/",
        },
      });
    }

    // Return the stored JSON data
    return NextResponse.json(result[0].data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Updates justice bus events data
 * Note: Authentication removed for demonstration purposes
 * In production, this should be authenticated
 */
export async function POST(request: Request) {
  // In a real implementation, we would verify authentication here

  try {
    const rawData = await request.json();

    // Validate data structure against our detailed schema
    const validationResult = justiceBusEventsSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid data format",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Insert as a new record
    await db.insert(justiceBusEvents).values({
      data,
      lastUpdated: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating events:", error);
    return NextResponse.json(
      { error: "Failed to update events" },
      { status: 500 }
    );
  }
}
