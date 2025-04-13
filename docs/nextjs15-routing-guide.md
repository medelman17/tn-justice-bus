# Next.js 15 Routing Implementation Guide

## Overview

This guide documents the key routing features in Next.js 15 that are relevant to the Tennessee Justice Bus application. It provides guidance on implementation approaches, migration considerations, and best practices for leveraging Next.js 15's routing capabilities in the context of our offline-first rural connectivity requirements.

## Table of Contents

1. [Introduction](#introduction)
2. [App Router Core Concepts](#app-router-core-concepts)
3. [Page Component Props](#page-component-props)
4. [Navigation and Loading States](#navigation-and-loading-states)
5. [Server-Side Routing Features](#server-side-routing-features)
6. [Performance Optimizations](#performance-optimizations)
7. [Implications for Tennessee Justice Bus](#implications-for-tennessee-justice-bus)
8. [Implementation Steps](#implementation-steps)
9. [Resources](#resources)

## Introduction

Next.js 15 (current version 15.3.0) continues to build on the App Router architecture introduced in Next.js 13. This guide summarizes key routing features and concepts relevant to the Tennessee Justice Bus project, which currently uses Next.js 14+ with App Router, outlining migration considerations and implementation benefits.

The App Router represents a significant enhancement over the Pages Router, offering features particularly valuable for applications that need to function reliably in low-connectivity environments:

- Server Components for reduced client-side JavaScript
- Enhanced loading states and error handling
- Improved caching and rendering strategies
- Flexible routing patterns supporting complex application flows

This implementation guide provides a framework for leveraging these features effectively within our application.

## App Router Core Concepts

The App Router uses a file-system based routing approach where folders define routes, with special files handling UI components for each route segment.

### Folder Structure and Special Files

```
app/
├── layout.js      # Shared UI for a segment and its children
├── page.js        # UI for the route segment
├── loading.js     # Loading UI for the segment
├── error.js       # Error UI for the segment
├── not-found.js   # Not found UI
├── global-error.js # Global error UI
└── route.js       # Server-side API endpoint
```

### Key Routing Patterns

1. **Nested Routes**: Folder nesting creates route nesting (`app/dashboard/profile/page.js` → `/dashboard/profile`)

2. **Dynamic Routes**: Use brackets for dynamic segments (`app/case/[id]/page.js` → `/case/123`)

3. **Route Groups**: Parentheses create logical groups without affecting URL structure:

   ```
   app/
   ├── (auth)/     # Group authentication-related routes
   │   ├── login/
   │   ├── signup/
   │   └── verify/
   └── (client)/   # Group client-related features
       ├── profile/
       └── cases/
   ```

4. **Parallel Routes**: Simultaneous rendering of multiple pages in the same layout using `@` prefix:

   ```
   app/
   ├── dashboard/
   │   ├── layout.js
   │   ├── page.js
   │   ├── @stats/
   │   │   └── page.js
   │   └── @activity/
   │       └── page.js
   ```

5. **Intercepting Routes**: Show content within current layout using the `(..)` syntax:
   ```
   app/
   ├── cases/
   │   ├── page.js          # /cases
   │   └── [id]/
   │       └── page.js      # /cases/123
   └── (.)cases/
       └── [id]/
           └── page.js      # Intercepts /cases/123 in a modal while viewing /cases
   ```

## Page Component Props

Next.js 15 introduces a significant change to page component props. In page components (`page.js` or `page.tsx` files), the props are now **Promise-based**:

- **params**: A promise that resolves to an object containing route parameters for dynamic routes
- **searchParams**: A promise that resolves to an object containing the current URL's query parameters

### Migration Example

```tsx
// Current implementation (Next.js 14 and earlier)
export default function VerifyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const verificationType = searchParams.type || "email";

  // Component implementation
}

// Next.js 15 implementation option 1 (async/await)
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const verificationType = resolvedParams.type || "email";

  // Component implementation
}

// Next.js 15 implementation option 2 (use function)
import { use } from "react";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const resolvedParams = use(searchParams);
  const verificationType = resolvedParams.type || "email";

  // Component implementation
}
```

This change affects all page components in the application and will require refactoring during a Next.js 15 migration.

## Navigation and Loading States

Next.js 15 enhances the user experience during navigation with several key features particularly valuable for low-connectivity environments:

### Loading UI

Implement `loading.js` files to create instant loading UI while page content loads:

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="h-16 w-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );
}
```

This creates a seamless loading experience even on slow connections, as the loading UI appears instantly while data is fetched in the background.

### Error Handling

Implement `error.js` files to handle runtime errors gracefully:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong
      </h2>
      <p className="mb-6 text-gray-600 max-w-md">
        {error.message ||
          "An unexpected error occurred while loading this page."}
      </p>
      <p className="mb-6 text-sm text-gray-500">
        If you're offline, try connecting to the internet and try again.
      </p>
      <Button onClick={reset} variant="default" className="px-4 py-2">
        Try again
      </Button>
    </div>
  );
}
```

This enables graceful error recovery, particularly important in rural areas where connectivity issues might cause more frequent errors.

### Not Found UI

Implement `not-found.js` to handle non-existent routes:

```tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-primary mb-4">Page Not Found</h2>
      <p className="mb-6 text-gray-600 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/dashboard"
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Return to Dashboard
      </a>
    </div>
  );
}
```

## Server-Side Routing Features

### Middleware

Next.js middleware runs before a request is completed, allowing for authentication, redirects, and request modification:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Protected routes logic
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/intake");

  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Specify which routes should trigger this middleware
export const config = {
  matcher: ["/dashboard/:path*", "/intake/:path*", "/api/protected/:path*"],
};
```

### Route Handlers

Server-side API endpoints defined in `route.js` files provide customized request handling:

```typescript
// app/api/documents/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await db.query.documents.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
```

Route handlers provide a clean, standardized way to handle API requests with Next.js, particularly useful for offline-first applications that need to handle requests reliably even with intermittent connectivity.

## Performance Optimizations

Next.js 15 introduces several performance optimizations that are particularly valuable for the Tennessee Justice Bus application:

### 1. Partial Prerendering (PPR)

PPR allows pages to stream in dynamic content while still benefiting from static rendering:

- Parts of the page that can be statically rendered are delivered instantly
- Dynamic parts stream in as they become available
- This creates a more responsive user experience on slow networks

Implementation:

```tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <main>
      <h1>Justice Bus Dashboard</h1>

      {/* Static parts render immediately */}
      <nav className="dashboard-nav">...</nav>

      {/* Dynamic parts stream in */}
      <Suspense fallback={<CaseListSkeleton />}>
        <CaseList />
      </Suspense>
    </main>
  );
}
```

### 2. Optimized Caching

Next.js 15 enhances its caching system with more granular control:

- Route segment-based caching (different caching strategies for different parts of the app)
- Improved data caching with revalidation options
- Fetch caching to avoid redundant network requests

### 3. Progressive Hydration

Server Components in Next.js 15 support progressive hydration:

- Initial HTML is streamed from the server
- JavaScript for interactivity is loaded incrementally
- Critical paths are prioritized for faster time-to-interactive

This is particularly beneficial for users in rural areas with limited bandwidth.

## Implications for Tennessee Justice Bus

The new routing features in Next.js 15 offer significant benefits for the Tennessee Justice Bus application:

### 1. Enhanced Offline Experience

- Better error boundaries for graceful degradation during connectivity issues
- Improved loading states for better user feedback during slow network conditions
- More efficient client-side JavaScript delivery, reducing bandwidth requirements

### 2. More Intuitive Navigation Patterns

- Route groups allow logical organization of features (auth, client intake, case management)
- Parallel routes enable dashboard views with multiple simultaneous data displays
- Intercepting routes create smoother user flows for viewing case details

### 3. Performance in Rural Areas

- Faster initial page loads through partial prerendering
- Reduced bandwidth usage through optimized component delivery
- Better resilience to connectivity interruptions

### 4. Implementation Considerations

- Requires updating existing page components to handle Promise-based props
- Need to adapt middleware for new routing patterns
- Opportunity to enhance error handling throughout the application

## Implementation Steps

To upgrade the Tennessee Justice Bus application to Next.js 15, follow these steps:

### 1. Preparation Phase

1. **Audit Current Routes**:

   - Document all existing routes and their implementations
   - Identify page components that use `searchParams` or dynamic parameters
   - Note areas with potential for route groups or parallel routes

2. **Set Up Development Environment**:

   - Create a separate branch for the migration
   - Update Next.js to version 15:
     ```bash
     pnpm up next@latest
     ```
   - Update related dependencies

3. **Update TypeScript Configuration**:
   - Ensure type definitions are compatible with Next.js 15

### 2. Migration Phase

1. **Update Page Components**:

   - Convert all page components to handle Promise-based props:
     - Use `async/await` or React's `use` function
     - Update TypeScript types for parameters

2. **Enhance Error Handling**:

   - Add or update `error.js` files for key route segments
   - Implement offline-specific error states

3. **Improve Loading States**:

   - Add or update `loading.js` files for better user feedback
   - Implement suspense boundaries for streaming content

4. **Reorganize Routes** (optional):
   - Consider implementing route groups for logical organization
   - Evaluate opportunities for parallel routes in the dashboard
   - Implement intercepting routes for viewing case details

### 3. Testing Phase

1. **Connectivity Testing**:

   - Test the application under various network conditions:
     - Slow 3G
     - Intermittent connectivity
     - Complete offline operation
     - Reconnection scenarios

2. **Performance Testing**:

   - Measure and compare performance metrics before and after migration
   - Verify improved Time to First Byte (TTFB) and Time to Interactive (TTI)

3. **Compatibility Testing**:
   - Test across different browsers and devices
   - Ensure PWA functionality is preserved

### 4. Deployment

1. **Staged Rollout**:

   - Consider a phased deployment approach
   - Monitor performance and error rates closely

2. **Documentation Update**:
   - Update internal documentation to reflect new routing patterns
   - Create development guidelines for new routes

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js 15 Performance Optimizations](https://nextjs.org/blog/next-15)
- [Partial Prerendering Guide](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
- [Route Handler API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Server Components Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

This guide is maintained by the Tennessee Justice Bus development team. Last updated: April 12, 2025.
