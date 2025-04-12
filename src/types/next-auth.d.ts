import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in User type with custom fields
   */
  interface User {
    id: string;
    phone?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    preferredContactMethod?: string | null;
    lastLogin?: Date | null;
  }

  /**
   * Extend the session object to include custom properties
   */
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Extend the JWT token */
  interface JWT {
    id: string;
    phone?: string | null;
    email?: string | null;
    iat?: number;
  }
}
