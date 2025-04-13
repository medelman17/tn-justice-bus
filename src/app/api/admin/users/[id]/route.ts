import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { users } from "@/db/schema/users";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/users/:id - Update an existing user
export async function PUT(request: Request, context: RouteContext) {
  try {
    // Check authorization
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params
    const params = await context.params;
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userData = await request.json();

    // Basic validation
    if (!userData.firstName || !userData.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id - Delete a user
export async function DELETE(request: Request, context: RouteContext) {
  try {
    // Check authorization
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params
    const params = await context.params;
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete the user
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
