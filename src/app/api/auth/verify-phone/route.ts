import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getKnockClient, WORKFLOWS, KnockRecipient } from "@/lib/knock";
import { db } from "@/lib/db";
// We'll check for verification code schema in the schema - for now using a placeholder structure
// In a production app, this would be defined in the schema
// import { verificationCodes } from "@/db/schema";
import { randomUUID } from "crypto";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
});

// Mock verification codes storage
// In a production app, this would be stored in the database
const mockVerificationStorage = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = phoneSchema.parse(body);

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const verificationId = randomUUID();

    // Store in mock storage (in production, this would be in the database)
    mockVerificationStorage.set(phone, {
      id: verificationId,
      code,
      expiresAt,
      createdAt: new Date(),
    });

    // In a production app, we would store in the database:
    /*
    await db.insert(verificationCodes).values({
      id: verificationId,
      phone,
      code,
      expiresAt,
      createdAt: new Date(),
    });
    */

    // Get Knock client
    const knock = getKnockClient();

    try {
      // Prepare recipient - using the phone number as the ID for new users
      const recipient: KnockRecipient = {
        id: phone,
        phone_number: phone,
      };

      // Send verification code via Knock
      await knock.workflows.trigger(WORKFLOWS.VERIFICATION_CODE, {
        recipients: [recipient],
        data: {
          code,
          expires_in: "10 minutes",
          app_name: "Tennessee Justice Bus",
        },
      });

      console.log(`Verification code sent to ${phone}`);
    } catch (knockError) {
      console.error("Error sending verification code via Knock:", knockError);
      throw new Error(
        `Failed to send code: ${knockError instanceof Error ? knockError.message : "Unknown error"}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Error in verify-phone API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    console.error("Error details:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send verification code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
