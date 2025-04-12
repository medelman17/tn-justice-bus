import NextAuth from "next-auth/next";
import { authOptions } from "../auth";

// Export handler function for API route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
