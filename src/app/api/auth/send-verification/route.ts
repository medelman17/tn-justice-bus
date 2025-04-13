import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificationCodes } from "@/db/schema";
import { getKnockClient, WORKFLOWS } from "@/lib/knock";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Constants for rate limiting
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

// In-memory store for rate limiting (use Redis or similar in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const key = `ratelimit:${phone}`;
  const record = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + RATE_LIMIT.WINDOW_MS,
  };

  // Reset counter if window has passed
  if (record.resetAt < now) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT.WINDOW_MS;
  }

  // Check if rate limited
  if (record.count >= RATE_LIMIT.MAX_ATTEMPTS) {
    return true;
  }

  // Increment counter
  record.count += 1;
  rateLimitStore.set(key, record);
  return false;
}

// Function to generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const phoneSchema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = phoneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const { phone } = result.data;

    // Check rate limiting
    if (isRateLimited(phone)) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Generate a verification code
    const code = generateVerificationCode();

    // Calculate expiration (10 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Delete any existing codes for this phone number
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.phone, phone));

    // Store the new code
    await db.insert(verificationCodes).values({
      phone,
      code,
      expires,
    });

    // Send the code via Knock SMS with proper logging
    const knock = getKnockClient();
    console.log(`Sending verification code to ${phone}`);
    await knock.workflows.trigger(WORKFLOWS.VERIFICATION_CODE, {
      recipients: [
        {
          id: phone, // Use phone as id for non-registered users
          phone_number: phone, // Use the correct field name per Knock API
        },
      ],
      data: {
        code,
        expiresMinutes: 10,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
