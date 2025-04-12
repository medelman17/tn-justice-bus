import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";

// Import our db utilities
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

// Initialize Supabase client for auth operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase credentials not properly configured");
}

/**
 * Options for NextAuth
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "",
      from: process.env.EMAIL_FROM || "noreply@tnjusticebus.org",
    }),
    CredentialsProvider({
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.code) return null;

        try {
          // In a real application, we would verify the code against a stored code
          // For development, we'll validate any 6-digit code format
          const isValidCode =
            credentials.code.length === 6 && /^\d+$/.test(credentials.code);
          if (!isValidCode) return null;

          // Find the user by phone number
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
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
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
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;

        // Include contact info if available
        if (token.phone) {
          session.user.phone = token.phone;
        }

        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user }: { user: any }) {
      // Update last_login timestamp
      if (user?.id) {
        try {
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));
        } catch (error) {
          console.error("Error updating last login:", error);
        }
      }
    },
  },
  // Debug is helpful during development
  debug: process.env.NODE_ENV === "development",
};
