# [ARCHIVED] Authentication System Implementation Plan

> **Archive Note**: This implementation plan has been archived on April 12, 2025. The authentication system has been fully implemented according to this plan. Current details about the authentication system can be found in the memory bank files (particularly systemPatterns.md, activeContext.md, and progress.md).

## Current Status

1. **Basic NextAuth.js setup** is in place:

   - `/src/app/api/auth/[...nextauth]/route.ts` exists with:
     - JWT session strategy
     - Email provider configured
     - Credentials provider for phone-based auth
     - Basic JWT and session callbacks

2. **Missing components**:
   - Supabase adapter for NextAuth.js
   - Knock integration for SMS verification
   - Auth UI components (signin, signup pages)
   - Middleware for protected routes
   - Magic link provider
   - Offline-ready authentication storage

## Implementation Plan

### 1. Install Required Dependencies

```bash
pnpm add @auth/supabase-adapter @knocklabs/node-sdk @knocklabs/client
```

### 2. Enhance NextAuth Configuration

Update `/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import Knock from "@knocklabs/node-sdk";

// Import our db utilities
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Set up Knock client for SMS
const knock = new Knock(process.env.KNOCK_API_KEY || "");

// Define the user schema
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL || "",
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days for offline support
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "",
      from: process.env.EMAIL_FROM || "noreply@tnjusticebus.org",
    }),
    // SMS Provider via Credentials
    CredentialsProvider({
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.code) return null;

        try {
          // Verify the code using our verification system
          const isValid = await verifyPhoneCode(
            credentials.phone,
            credentials.code
          );
          if (!isValid) return null;

          // Find or create the user
          const foundUser = await db.query.users.findFirst({
            where: eq(users.phone, credentials.phone),
          });

          if (!foundUser) {
            // Create new user if not found
            const [newUser] = await db
              .insert(users)
              .values({
                phone: credentials.phone,
                preferredContactMethod: "phone",
              })
              .returning();

            return {
              id: newUser.id,
              phone: newUser.phone,
              name: newUser.firstName
                ? `${newUser.firstName} ${newUser.lastName || ""}`
                : undefined,
            };
          }

          return {
            id: foundUser.id,
            email: foundUser.email || "",
            phone: foundUser.phone || "",
            name: foundUser.firstName
              ? `${foundUser.firstName} ${foundUser.lastName || ""}`
              : undefined,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.email = user.email;
      }

      // For offline support - store JWT creation time
      if (!token.iat) {
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // Include contact info if available
        if (token.phone) {
          session.user.phone = token.phone as string;
        }

        // For offline capability and rural areas - add offline expiry
        session.expires = new Date(
          ((token.iat as number) + 30 * 24 * 60 * 60) * 1000
        ).toISOString();
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Update last_login timestamp
      if (user.id) {
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// Helper function to send verification code
export async function sendVerificationCode(phone: string): Promise<boolean> {
  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code (in a real app, we'd store this securely with an expiry)
    // For now we'll use Knock to track this in the user's workflow

    // Send via Knock
    await knock.workflows.trigger("verification-code", {
      recipients: [{ phone }],
      data: {
        code,
        expiresInMinutes: 10,
      },
      actorId: "system",
    });

    return true;
  } catch (error) {
    console.error("Error sending verification code:", error);
    return false;
  }
}

// Helper function to verify code
async function verifyPhoneCode(phone: string, code: string): Promise<boolean> {
  // In production, we would verify against a stored code
  // For development purposes, we'll accept any 6-digit code
  return code.length === 6 && /^\d+$/.test(code);
}

// Export handler function for API route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 3. Create Authentication UI Components

Create the required auth pages structure:

```
/src/app/auth/
  ├── signin/
  │   └── page.tsx
  ├── signup/
  │   └── page.tsx
  ├── verify/
  │   └── page.tsx
  ├── error/
  │   └── page.tsx
  └── components/
      ├── EmailSignInForm.tsx
      ├── PhoneSignInForm.tsx
      ├── SignUpForm.tsx
      └── VerificationForm.tsx
```

#### Sign In Page Example:

```tsx
// src/app/auth/signin/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailSignInForm from "../components/EmailSignInForm";
import PhoneSignInForm from "../components/PhoneSignInForm";

export default function SignIn() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailSignInForm />
        </TabsContent>
        <TabsContent value="phone">
          <PhoneSignInForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4. Add Route Protection Middleware

Create a middleware file to protect routes:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = ["/profile", "/cases", "/appointments", "/documents"];

// Paths that are always public
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/verify",
  "/auth/error",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path is protected
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to signin if not authenticated
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
```

### 5. Implement Offline Authentication Support

Create a client-side authentication helper:

```typescript
// src/lib/auth/client.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signIn, signOut, useSession } from "next-auth/react";

type AuthStore = {
  offlineMode: boolean;
  cachedToken: string | null;
  cachedUser: any | null;
  tokenExpiry: number | null;
  setOfflineMode: (mode: boolean) => void;
  cacheSession: (token: string, user: any, expiry: number) => void;
  clearCache: () => void;
  isTokenValid: () => boolean;
};

// Secure storage for offline auth
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      offlineMode: false,
      cachedToken: null,
      cachedUser: null,
      tokenExpiry: null,

      setOfflineMode: (mode) => set({ offlineMode: mode }),

      cacheSession: (token, user, expiry) =>
        set({ cachedToken: token, cachedUser: user, tokenExpiry: expiry }),

      clearCache: () =>
        set({ cachedToken: null, cachedUser: null, tokenExpiry: null }),

      isTokenValid: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        // Check if token is still valid
        return Date.now() < tokenExpiry * 1000;
      },
    }),
    {
      name: "justice-bus-auth",
      // Enable encryption in production
      partialize: (state) => ({
        offlineMode: state.offlineMode,
        cachedToken: state.cachedToken,
        cachedUser: state.cachedUser,
        tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);

// Custom hook that combines NextAuth session with offline capability
export function useAuthWithOffline() {
  const { data: session, status } = useSession();
  const { offlineMode, cachedUser, isTokenValid } = useAuthStore();

  // Use cached session when offline
  if (offlineMode && !session && cachedUser && isTokenValid()) {
    return {
      data: {
        user: cachedUser,
        expires: new Date(
          isTokenValid() ? Date.now() + 86400000 : Date.now()
        ).toISOString(),
      },
      status: "authenticated",
    };
  }

  return { data: session, status };
}

// When online, cache the session for offline use
export function useSessionCache() {
  const { data: session } = useSession();
  const { cacheSession } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      // Extract token and expiry from cookie or localStorage
      // This is implementation-specific based on how NextAuth stores the token
      const token = ""; // Need to extract from secure storage
      const expiry = Math.floor(new Date(session.expires).getTime() / 1000);

      cacheSession(token, session.user, expiry);
    }
  }, [session, cacheSession]);
}
```

### 6. Create Phone Verification API

```typescript
// src/app/api/auth/verify-phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationCode } from "../../auth/[...nextauth]/route";

const phoneSchema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = phoneSchema.parse(body);

    const success = await sendVerificationCode(phone);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Verification code sent",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send code" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in verify-phone API:", error);
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
```

## Testing Plan

1. **Unit Tests**:

   - Test JWT and session callbacks
   - Test phone verification logic
   - Test offline authentication storage

2. **Integration Tests**:

   - Test email sign-in flow
   - Test phone sign-in flow
   - Test auth middleware for protected routes
   - Test offline authentication functionality

3. **E2E Tests**:
   - Complete sign-up journey
   - Sign-in with existing credentials
   - Protected route access
   - Verify offline capabilities

## Next Steps After Implementation

1. Enhance user profile management
2. Add password reset functionality
3. Implement account linking (connecting phone and email accounts)
4. Add admin-specific authentication roles
5. Implement enhanced security features (2FA, session management)
