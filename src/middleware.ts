import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/profile",
  "/cases",
  "/appointments",
  "/documents",
];

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
    // Check for auth session cookie
    const hasSession = checkForSessionCookie(request);

    // Redirect to signin if not authenticated
    if (!hasSession) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// Simple helper function to check for session cookie
function checkForSessionCookie(req: NextRequest): boolean {
  // Check for NextAuth.js session cookies
  return !!(
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value
  );
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
