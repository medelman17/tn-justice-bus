import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "temporary-secret-for-development",
  providers: [
    // Phone authentication provider
    CredentialsProvider({
      id: "phone-login",
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.code) return null;

        // Simple format validation for edge compatibility
        // The actual verification against stored codes happens in auth.ts
        const phoneStr = String(credentials.phone);
        const codeStr = String(credentials.code);

        // Validate phone number and code format
        const isValidPhone = /^\+?[0-9]{10,15}$/.test(phoneStr);
        const isValidCode = codeStr.length === 6 && /^\d{6}$/.test(codeStr);

        if (!isValidPhone || !isValidCode) return null;

        // The actual user lookup and creation happens in auth.ts
        return {
          id: "edge-auth-placeholder",
          phone: phoneStr,
          email: "",
        };
      },
    }),
    // Email authentication provider
    CredentialsProvider({
      id: "email-login",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.code) return null;

        // Simple format validation for edge compatibility
        // The actual verification against stored codes happens in auth.ts
        const emailStr = String(credentials.email);
        const codeStr = String(credentials.code);

        // Validate email and code format
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
        const isValidCode = codeStr.length === 6 && /^\d{6}$/.test(codeStr);

        if (!isValidEmail || !isValidCode) return null;

        // The actual user lookup and creation happens in auth.ts
        return {
          id: "edge-auth-placeholder",
          email: emailStr,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public paths that don't require authentication
      const publicPaths = [
        "/",
        "/auth/signin",
        "/auth/signup",
        "/auth/verify",
        "/auth/error",
        "/api/auth",
        "/offline",
      ];

      const isPublicPath = publicPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (isPublicPath) return true;

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        // Ensure all values are properly typed as strings
        token.id = user.id as string;
        token.phone = (user.phone as string) || "";
        token.email = (user.email as string) || "";
      }

      if (!token.iat) {
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // Convert all values to strings with proper fallbacks to ensure type safety
        session.user.id = String(token.id || "unknown-id");

        // The NextAuth types expect these to be string | null
        session.user.phone = token.phone ? String(token.phone) : "";
        session.user.email = token.email ? String(token.email) : "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default authConfig;
