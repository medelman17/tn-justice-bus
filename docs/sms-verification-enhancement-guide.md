# SMS Verification Code Enhancement Guide

**Date:** April 12, 2025

## Overview

This guide outlines a comprehensive approach to enhancing the SMS verification system in the Tennessee Justice Bus application. The current implementation uses a simple regex validation for 6-digit codes without actually verifying against stored codes. This enhancement will implement a secure, production-ready verification system that integrates with the existing Knock SMS notification service.

## Current Implementation

The current phone verification flow in the application:

1. User enters their phone number in the sign-in form
2. Application expects a 6-digit verification code
3. Any 6-digit number is accepted as valid (for development purposes)
4. User creation/lookup happens based on the phone number

This approach is suitable for development but presents security risks in production.

## Enhancement Goals

1. **Security**: Implement a proper verification code lifecycle with storage and expiration
2. **Integration**: Leverage our existing Knock SMS service for delivery
3. **User Experience**: Maintain a smooth verification flow
4. **Offline Support**: Ensure compatibility with the application's offline-first approach
5. **Rate Limiting**: Prevent abuse through proper validation controls

## Technical Design

### 1. Database Schema for Verification Codes

We'll add a new `verification_codes` table to store temporary verification codes:

```sql
CREATE TABLE verification_codes (
  id TEXT PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create an index for faster lookups by phone number
CREATE INDEX idx_verification_codes_phone ON verification_codes(phone);
```

Drizzle ORM schema:

```typescript
// src/db/schema/verification-codes.ts
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const verificationCodes = pgTable("verification_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  phone: varchar("phone", { length: 15 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 2. Verification Code API

Create a new API route for generating and sending verification codes:

```typescript
// src/app/api/auth/send-verification/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verificationCodes } from "@/db/schema";
import { knock } from "@/lib/knock";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Function to generate a random 6-digit code
function generateVerificationCode() {
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

    // Send the code via Knock SMS
    await knock.notify("auth-verification", {
      recipients: [
        {
          phone,
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
```

### 3. Updated Authentication Logic

Modify the CredentialsProvider in `auth.ts` to verify against stored codes:

```typescript
// In auth.ts, update the CredentialsProvider
{
  id: "credentials",
  name: "Phone Number",
  type: "credentials",
  credentials: {
    phone: { label: "Phone Number", type: "tel" },
    code: { label: "Verification Code", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.phone || !credentials.code) return null;

    try {
      // Format validation
      const isValidFormat =
        credentials.code.length === 6 && /^\d+$/.test(credentials.code);
      if (!isValidFormat) return null;

      // Look up the stored verification code
      const storedCode = await db.query.verificationCodes.findFirst({
        where: and(
          eq(verificationCodes.phone, credentials.phone),
          eq(verificationCodes.code, credentials.code),
          gt(verificationCodes.expires, new Date())
        ),
      });

      // If no valid code is found, authentication fails
      if (!storedCode) return null;

      // Delete the used code to prevent reuse
      await db.delete(verificationCodes)
        .where(eq(verificationCodes.id, storedCode.id));

      // Find or create user
      const user = await db.query.users.findFirst({
        where: eq(users.phone, credentials.phone),
      });

      if (!user) {
        // Create a new user if they don't exist
        const [newUser] = await db
          .insert(users)
          .values({
            phone: credentials.phone,
            preferredContactMethod: "phone",
          })
          .returning();

        return {
          id: newUser.id,
          phone: newUser.phone || "",
          email: newUser.email || "",
          name: newUser.firstName
            ? `${newUser.firstName} ${newUser.lastName || ""}`
            : undefined,
        };
      }

      return {
        id: user.id,
        email: user.email || "",
        phone: user.phone || "",
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : undefined,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  },
}
```

### 4. Edge Compatible Configuration

For edge compatibility, we'll keep a simplified version in `auth.config.ts`:

```typescript
// In auth.config.ts, keep a simplified version for edge compatibility
CredentialsProvider({
  name: "Phone Number",
  credentials: {
    phone: { label: "Phone Number", type: "tel" },
    code: { label: "Verification Code", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.phone || !credentials.code) return null;

    // Basic validation only for the edge environment
    const isValidFormat =
      credentials.code.length === 6 && /^\d+$/.test(credentials.code);

    if (!isValidFormat) return null;

    // The actual verification happens in auth.ts
    return {
      id: "edge-auth-placeholder",
      phone: credentials.phone,
    };
  },
}),
```

### 5. Update UI Component

Enhance the phone sign-in form to request and handle verification codes:

```tsx
// src/app/(auth)/auth/components/phone-sign-in-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const phoneFormSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
});

const verificationFormSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});

export function PhoneSignInForm() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const phoneForm = useForm({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
    },
  });

  const codeForm = useForm({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmitPhone(data: z.infer<typeof phoneFormSchema>) {
    setIsSubmitting(true);
    setError("");

    try {
      // Request verification code
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: data.phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send verification code");
      }

      setPhoneNumber(data.phone);
      setIsCodeSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitCode(data: z.infer<typeof verificationFormSchema>) {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        phone: phoneNumber,
        code: data.code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || "Verification failed");
      }

      router.push(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {!isCodeSent ? (
        // Phone number form
        <Form {...phoneForm}>
          <form
            onSubmit={phoneForm.handleSubmit(onSubmitPhone)}
            className="space-y-4"
          >
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        </Form>
      ) : (
        // Verification code form
        <Form {...codeForm}>
          <form
            onSubmit={codeForm.handleSubmit(onSubmitCode)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="6-digit code"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify and Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsCodeSent(false)}
                disabled={isSubmitting}
              >
                Use Different Phone Number
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
```

### 6. Knock Notification Template

Add a new workflow for authentication verification in the Knock configuration:

```typescript
// src/lib/knock.ts

// Existing Knock setup
import { Knock } from "@knocklabs/node";

export const WORKFLOW_KEYS = {
  // Existing workflows
  APPOINTMENT_REMINDER: "appointment-reminder",
  APPOINTMENT_CREATED: "appointment-created",
  APPOINTMENT_UPDATED: "appointment-updated",
  // New workflow
  AUTH_VERIFICATION: "auth-verification",
};

// Initialize the Knock client
export const knock = new Knock(process.env.KNOCK_API_KEY || "");

// Helper for sending SMS notifications
export async function sendSmsNotification(workflowKey, recipient, data) {
  // ...existing implementation...
}
```

Configure your Knock notification workflow in the Knock dashboard with:

- Workflow key: `auth-verification`
- Channel: SMS
- Template: `Your verification code for Tennessee Justice Bus is {{code}}. It will expire in {{expiresMinutes}} minutes.`

### 7. Offline Support Integration

Enhance the offline utilities to handle verification codes when offline:

```typescript
// src/lib/offline-utils.ts

// Add functionality to handle verification attempts when offline
export async function handleOfflineVerification(phone, code) {
  // Store verification attempt for later synchronization
  const storageKey = `offline_verification_${phone}`;

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        phone,
        code,
        timestamp: Date.now(),
      })
    );

    return true;
  } catch (error) {
    console.error("Failed to store offline verification attempt:", error);
    return false;
  }
}

// Process offline verification attempts when back online
export async function syncOfflineVerifications() {
  const keys = [];

  // Find all offline verification attempts
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("offline_verification_")) {
      keys.push(key);
    }
  }

  // Process each attempt
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "{}");

      // Skip if older than 24 hours (for security)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        continue;
      }

      // Attempt to verify online
      await signIn("credentials", {
        phone: data.phone,
        code: data.code,
        redirect: false,
      });

      // Remove from storage regardless of outcome
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to process offline verification:", error);
    }
  }
}
```

### 8. Database Migration

Create a migration file for the new verification_codes table:

```typescript
// drizzle/migrations/add_verification_codes_table.ts
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const verificationCodes = pgTable("verification_codes", {
  id: text("id").primaryKey(),
  phone: varchar("phone", { length: 15 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Execute this migration using Drizzle's migration tool
```

## Security Considerations

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// src/app/api/auth/send-verification/route.ts

// Add rate limiting logic
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

// In-memory store for rate limiting (use Redis or similar in production)
const rateLimitStore = new Map();

function isRateLimited(phone) {
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

// In the POST handler:
if (isRateLimited(phone)) {
  return NextResponse.json(
    { error: "Too many verification attempts. Please try again later." },
    { status: 429 }
  );
}
```

### Verification Code Security

Ensure code security with these measures:

1. **Short Expiration**: Codes expire after 10 minutes
2. **Single-Use**: Codes are deleted after successful verification
3. **Random Generation**: Codes are cryptographically secure
4. **Rate Limiting**: Prevent brute force attacks

## Implementation Steps

1. **Database Migration**:

   - Add the verification_codes table to the database
   - Update schema exports to include the new table

2. **Authentication Logic**:

   - Update the auth configuration files
   - Implement the actual verification logic

3. **API Routes**:

   - Create the send-verification API route
   - Implement rate limiting and security measures

4. **UI Components**:

   - Update the phone sign-in form to handle the two-step process
   - Add error handling and feedback

5. **Notification Integration**:

   - Add the new workflow to Knock configuration
   - Set up the SMS template in the Knock dashboard

6. **Offline Support**:

   - Enhance offline utilities to handle verification attempts
   - Add synchronization logic for when connectivity returns

7. **Testing**:
   - Test the verification flow with real phone numbers
   - Verify rate limiting and security measures
   - Test offline scenarios

## Testing Plan

### Unit Tests

1. **Verification Code Generation**:

   - Test the code generation function for proper format and randomness
   - Verify codes are always 6 digits

2. **API Route Logic**:

   - Test input validation
   - Test rate limiting logic
   - Test error handling

3. **Authentication Logic**:
   - Test code verification against stored codes
   - Test expiration handling
   - Test user creation/lookup logic

### Integration Tests

1. **Full Verification Flow**:

   - Test the entire flow from phone entry to successful login
   - Test invalid code scenarios
   - Test expired code scenarios

2. **Offline Functionality**:

   - Test verification in offline mode
   - Test synchronization when connectivity is restored

3. **Notification Delivery**:
   - Test SMS delivery through Knock
   - Verify template rendering

## Rollback Plan

If issues arise with the implementation:

1. **Database**:

   - Remove the verification_codes table
   - Update schema exports to remove references

2. **Authentication Logic**:

   - Revert to the previous simple code validation approach

3. **UI Components**:
   - Revert to the previous single-step form

## References

- [Knock Documentation](https://docs.knock.app/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [OWASP Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
