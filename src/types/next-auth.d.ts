import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id: string;
      /** The user's phone number if available */
      phone?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * User object returned by OAuth providers, Credentials, or database adapter
   */
  interface User extends DefaultUser {
    /** The user's phone number if available */
    phone?: string | null;
    /** User's first name if available */
    firstName?: string | null;
    /** User's last name if available */
    lastName?: string | null;
    /** User's preferred contact method */
    preferredContactMethod?: string;
    /** Timestamp of last login */
    lastLogin?: Date;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's ID */
    id: string;
    /** The user's phone number if available */
    phone?: string | null;
    /** The JWT creation time */
    iat?: number;
  }
}
