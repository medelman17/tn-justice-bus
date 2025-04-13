import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { authConfig } from "./auth.config";

// Initialize Supabase client for auth operations
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey,
  }),
  providers: [
    // Add EmailProvider here since it's not edge-compatible
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://user:password@localhost:1025",
      from: process.env.EMAIL_FROM || "noreply@tnjusticebus.org",
    }),
    // Override the CredentialsProvider to include database operations
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
          // In a real application, we would verify the code against a stored code
          // For development, we'll validate any 6-digit code format
          const phoneStr = String(credentials.phone);
          const codeStr = String(credentials.code);
          const isValidCode = codeStr.length === 6 && /^\d+$/.test(codeStr);

          if (!isValidCode) return null;

          // Find the user by phone number
          const user = await db.query.users.findFirst({
            where: eq(users.phone, phoneStr),
          });

          if (!user) {
            // Create a new user if they don't exist
            const [newUser] = await db
              .insert(users)
              .values({
                phone: phoneStr,
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
    },
  ],
  events: {
    async signIn({ user }) {
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
});
