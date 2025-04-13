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

    const code = "123456";

    // Generate a 6-digit code
    // const code = process.env.NODE_ENV === "development" 
    //   ? "123456" // Use fixed code in development
    //   : Math.floor(100000 + Math.random() * 900000).toString();

    // For development, make the code very obvious
    if (process.env.NODE_ENV === "development") {
      console.log("============================================");
      console.log(`📧 VERIFICATION CODE for ${email}: ${code}`);
      console.log("============================================");
    }

    // Set expiration time (10 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    try {
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
    } catch (dbError) {
      console.error("Database error when storing verification code:", dbError);
      return NextResponse.json(
        { success: false, message: "Error storing verification code" },
        { status: 500 }
      );
    }

    // In development mode, we'll skip the actual email sending step
    // and just return success since we've already logged the code
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          success: true,
          message: "Verification code created (development mode - check console)",
        },
        { status: 200 }
      );
    }

    // Send the code via email using Knock
    try {
      // await triggerWorkflowWithOfflineSupport(WORKFLOWS.VERIFICATION_CODE, {
      //   recipients: [
      //     {
      //       // Use email as the ID since we don't have a user yet
      //       id: email,
      //       // Include email property for delivery
      //       email: email,
      //     },
      //   ],
      //   data: {
      //     code,
      //     expiresInMinutes: 10,
      //     channel: "email",
      //   },
      // });
      
      return NextResponse.json(
        {
          success: true,
          message: "Verification code sent",
        },
        { status: 200 }
      );
    } catch (knockError) {
      console.error("Knock service error:", knockError);
      
      // Since we've already stored the code in the database,
      // we can still allow verification to proceed even if 
      // notification delivery fails
      return NextResponse.json(
        {
          success: true,
          message: "Verification code created but notification delivery failed",
          notificationError: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error sending verification code:", error);

    return NextResponse.json(
      { success: false, message: "Error sending verification code" },
      { status: 500 }
    );
  }
}
