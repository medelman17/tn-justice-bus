import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { users, type User } from "@/db/schema/users";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/admin/users - List all users
export async function GET(request: Request) {
  try {
    // Check authorization (in a real app, you'd check admin role)
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users
    const allUsers = await db.select().from(users).orderBy(users.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: Request) {
  try {
    // Check authorization
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await request.json();

    // Basic validation
    if (!userData.firstName || !userData.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        addressLine1: userData.addressLine1,
        addressLine2: userData.addressLine2,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        preferredContactMethod: userData.preferredContactMethod,
        preferredLanguage: userData.preferredLanguage || "english",
      })
      .returning();

    return NextResponse.json(newUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
