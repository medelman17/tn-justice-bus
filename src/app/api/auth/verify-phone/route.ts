import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// We'll need to integrate Knock for SMS here in a real implementation
// This is a placeholder implementation for now

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = phoneSchema.parse(body);

    // In a real implementation, we would:
    // 1. Generate a 6-digit code
    // 2. Store the code with the phone number (Redis, database, etc.)
    // 3. Send the code via Knock

    // For now, simulate success
    // console.log(`Would send verification code to ${phone}`);

    // Generate a random 6-digit code (in production this would be stored)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Verification code for ${phone}: ${code}`);

    // Simulate a delay like a real SMS API
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    return NextResponse.json(
      { success: false, message: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
