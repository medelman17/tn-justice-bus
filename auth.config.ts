import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// EmailProvider removed from edge config as it's not edge-compatible

export const authConfig: NextAuthConfig = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "temporary-secret-for-development",
  providers: [
    // EmailProvider is removed here and only added in auth.ts, as it's not Edge compatible
    CredentialsProvider({
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.phone || !credentials.code) return null;

        // Simple validation for edge compatibility
        const phoneStr = String(credentials.phone);
        const codeStr = String(credentials.code);
        const isValidCode = codeStr.length === 6 && /^\d+$/.test(codeStr);

        if (!isValidCode) return null;

        // The actual user lookup and creation happens in auth.ts
        return {
          id: "edge-auth-placeholder",
          phone: phoneStr,
          email: "",
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
        token.id = user.id;
        token.phone = user.phone;
        token.email = user.email;
      }

      if (!token.iat) {
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // Make sure token.id exists and is a string
        session.user.id = token.id ? String(token.id) : "unknown-id";

        // Handle phone and email similarly, using null instead of undefined to match type definitions
        session.user.phone = token.phone ? String(token.phone) : null;
        session.user.email = token.email ? String(token.email) : null;
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
