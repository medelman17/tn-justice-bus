import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verificationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
// We'll use the same Knock service for email as we use for SMS
import { triggerWorkflowWithOfflineSupport, WORKFLOWS } from "@/lib/knock";

// Email validation schema
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const result = emailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Generate a 6-digit code
    const code = process.env.NODE_ENV === "development" 
      ? "123456" // Use fixed code in development
      : Math.floor(100000 + Math.random() * 900000).toString();

    // For development, make the code very obvious
    if (process.env.NODE_ENV === "development") {
      console.log("============================================");
      console.log(`📧 VERIFICATION CODE for ${email}: ${code}`);
      console.log("============================================");
    }

    // Set expiration time (10 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Delete any existing codes for this email
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.email, email));

    // Store the new verification code
    await db.insert(verificationCodes).values({
      email,
      code,
      expires,
    });

    // Send the code via email using Knock
    // This assumes your Knock setup supports email
    // If not, you'd use another email service here
    await triggerWorkflowWithOfflineSupport(WORKFLOWS.VERIFICATION_CODE, {
      recipients: [
        {
          // Use email as the ID since we don't have a user yet
          id: email,
          // Include email property for delivery
          email: email,
        },
      ],
      data: {
        code,
        expiresInMinutes: 10,
        channel: "email",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification code:", error);

    return NextResponse.json(
      { success: false, message: "Error sending verification code" },
      { status: 500 }
    );
  }
}
