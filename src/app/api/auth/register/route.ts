import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

// Registration validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .nullable(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" })
    .optional()
    .nullable(),
  preferredContactMethod: z.enum(["email", "phone", "sms"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: result.error.format(),
        },
        { status: 400 }
      );
    }

    const userData = result.data;

    // Check if we already have a user with this email or phone
    const existingUserByEmail = userData.email
      ? await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, userData.email as string),
        })
      : null;

    const existingUserByPhone = userData.phone
      ? await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.phone, userData.phone as string),
        })
      : null;

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 }
      );
    }

    if (existingUserByPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this phone number already exists",
        },
        { status: 409 }
      );
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email || null,
        phone: userData.phone || null,
        preferredContactMethod: userData.preferredContactMethod,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          preferredContactMethod: newUser.preferredContactMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
