import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";
import { users, verificationCodes } from "@/db/schema";
import { authConfig } from "./auth.config";

// Custom error classes
class InvalidVerificationCodeError extends CredentialsSignin {
  code = "Invalid or expired verification code";
}

class InvalidFormatError extends CredentialsSignin {
  code = "Invalid format for credentials";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Phone authentication provider
    Credentials({
      id: "phone-login",
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.code) return null;

        try {
          const phoneStr = String(credentials.phone);
          const codeStr = String(credentials.code);

          // Format validation
          const isValidFormat = codeStr.length === 6 && /^\d+$/.test(codeStr);
          if (!isValidFormat) {
            throw new InvalidFormatError();
          }

          // Look up the stored verification code
          const storedCode = await db.query.verificationCodes.findFirst({
            where: and(
              eq(verificationCodes.phone, phoneStr),
              eq(verificationCodes.code, codeStr),
              gt(verificationCodes.expires, new Date())
            ),
          });

          // If no valid code is found, authentication fails
          if (!storedCode) {
            throw new InvalidVerificationCodeError();
          }

          // Delete the used code to prevent reuse
          await db
            .delete(verificationCodes)
            .where(eq(verificationCodes.id, storedCode.id));

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

          // Update last login timestamp
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));

          return {
            id: user.id,
            email: user.email || "",
            phone: user.phone || "",
            name: user.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : undefined,
          };
        } catch (error) {
          console.error("Phone authentication error:", error);
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          return null;
        }
      },
    }),
    // Email authentication provider
    Credentials({
      id: "email-login",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.code) return null;

        try {
          const emailStr = String(credentials.email);
          const codeStr = String(credentials.code);

          // Format validation
          const isValidFormat = codeStr.length === 6 && /^\d+$/.test(codeStr);
          if (!isValidFormat) {
            throw new InvalidFormatError();
          }

          // Look up the stored verification code for email
          const storedCode = await db.query.verificationCodes.findFirst({
            where: and(
              eq(verificationCodes.email, emailStr),
              eq(verificationCodes.code, codeStr),
              gt(verificationCodes.expires, new Date())
            ),
          });

          // If no valid code is found, authentication fails
          if (!storedCode) {
            throw new InvalidVerificationCodeError();
          }

          // Delete the used code to prevent reuse
          await db
            .delete(verificationCodes)
            .where(eq(verificationCodes.id, storedCode.id));

          // Find the user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, emailStr),
          });

          if (!user) {
            // Create a new user if they don't exist
            const [newUser] = await db
              .insert(users)
              .values({
                email: emailStr,
                preferredContactMethod: "email",
              })
              .returning();

            return {
              id: newUser.id,
              email: newUser.email || "",
              phone: newUser.phone || "",
              name: newUser.firstName
                ? `${newUser.firstName} ${newUser.lastName || ""}`
                : undefined,
            };
          }

          // Update last login timestamp
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));

          return {
            id: user.id,
            email: user.email || "",
            phone: user.phone || "",
            name: user.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : undefined,
          };
        } catch (error) {
          console.error("Email authentication error:", error);
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          return null;
        }
      },
    }),
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
