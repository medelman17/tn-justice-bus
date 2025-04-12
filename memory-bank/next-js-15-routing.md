# Next.js 15 Routing: Feature Update

**Date:** April 12, 2025

## 1. Overview

Next.js 15 (current version 15.3.0) continues to build on the App Router architecture introduced in Next.js 13. This document summarizes the key routing features and concepts in Next.js 15 that are relevant to the Tennessee Justice Bus project, which is currently using Next.js 14+ with the App Router.

## 2. App Router Core Concepts

The App Router uses a file-system based routing approach where folders define routes, with special files handling UI components for each route segment. The project already leverages this architecture, but the following components are worth reviewing to ensure optimal implementation:

### 2.1 Folder Structure and Special Files

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

### 2.2 Page Component Props

Next.js 15 introduces an important change to page component props. In page components (`page.js` or `page.tsx` files), the props are now **Promise-based**:

- **params**: A promise that resolves to an object containing route parameters for dynamic routes
- **searchParams**: A promise that resolves to an object containing the current URL's query parameters

This requires changing the page component implementation to use `async/await` or React's `use` function.

The current implementation in `src/app/auth/verify/page.tsx` needs to be updated to match Next.js 15's approach:

```tsx
// Current implementation (needs updating for Next.js 15)
export default function VerifyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const verificationType = searchParams.type || "email";

  // Component implementation
}

// Next.js 15 correct implementation
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const verificationType = resolvedParams.type || "email";

  // Component implementation
}

// Alternative using React's use function
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

This change is significant because:

- In Next.js 14 and earlier, props were synchronous
- In Next.js 15, props are now promises that must be awaited
- This affects how data is accessed in page components
- All existing page components will need to be updated when migrating to Next.js 15

When implementing new pages or updating existing ones for Next.js 15, make sure to follow this new pattern for handling route parameters and query strings in a type-safe way.

### 2.3 Layouts and Templates

- **Layouts (`layout.js`)**: Shared UI that preserves state, remains interactive, and does not re-render when navigating between sibling routes.
- **Templates (`template.js`)**: Similar to layouts but create a new instance on each navigation, which means they don't preserve state.

Recommendation: Continue using layouts for persistent UI elements (navigation, sidebars) and consider templates for UI that should reset between navigations (e.g., animation sequences or certain form states).

### 2.4 Dynamic Routes

Dynamic segments can be created by wrapping a folder's name in square brackets: `[folderName]`. For example:

- `app/client/[id]/page.js`: Matches `/client/1`, `/client/abc`, etc.
- `app/case/[caseId]/document/[documentId]/page.js`: Matches nested dynamic segments

Next.js 15 supports both dynamic segments filled at request time and those prerendered at build time.

### 2.5 Route Groups

Route groups allow you to organize routes without affecting the URL structure, using parentheses around folder names: `(folderName)`.

Recommendation: Consider using route groups to organize the application, for example:

- `(auth)` - Group authentication-related routes
- `(client)` - Group client-related features
- `(admin)` - Group administrative features

### 2.6 Parallel Routes

Parallel routes allow you to simultaneously render multiple pages in the same layout. This is achieved with the `@folder` naming convention.

Potential Applications:

- Dashboard layouts with multiple independent sections
- Split views for intake form + preview
- Admin interfaces showing multiple data views simultaneously

### 2.7 Intercepting Routes

Intercepting routes allow you to load a route within the current layout while keeping the context of the current page. This uses the `(..)` syntax:

- `(..)` - Intercept the same level
- `(...)` - Intercept one level above
- `(...)(..)` - Intercept two levels above
- `(.)` - Intercept from the root app directory

This could be useful for features like:

- Viewing document details without leaving a list page
- In-place editing of profile information
- Modal workflows for capturing information

## 3. Navigation and Loading States

### 3.1 Navigation Components

- `<Link>` component handles client-side navigation
- `useRouter()` hook for programmatic navigation
- `<Script>` component for efficient script loading with navigation

### 3.2 Loading UI and Streaming

Next.js 15 continues to support React Suspense for handling loading states. Implement `loading.js` files to create loading UI that appears instantly while the content is loaded.

Importance for Justice Bus: This feature is crucial for rural users with limited connectivity, as it provides immediate feedback while content is loading in the background.

### 3.3 Error Handling

Next.js provides robust error handling through:

- `error.js` - Creates error UI boundaries for routes
- `not-found.js` - Custom UI for 404 errors
- `global-error.js` - Application-wide error handling

These features are essential for providing graceful error experiences, especially in low-connectivity environments where errors might be more common.

## 4. Server-Side Routing Features

### 4.1 Middleware

Middleware runs before a request is completed, allowing you to modify responses, rewrite or redirect requests, set headers, and handle authentication. The Justice Bus project already leverages middleware for route protection and authentication verification.

### 4.2 Route Handlers

Route handlers (defined in `route.js` files) allow you to create custom request handlers for a route using the Web Request and Response APIs. These are useful for API endpoints, which the project uses for authentication, data management, and external service integration.

### 4.3 Internationalization (i18n)

Next.js 15 supports both:

- Sub-path routing (`/en/about`, `/fr/about`)
- Domain routing (`example.com/about`, `example.fr/about`)

While not currently a priority for the Justice Bus application, the groundwork for future multi-language support (English/Spanish) should consider these patterns.

## 5. Performance Optimizations

Next.js 15 continues to emphasize performance with:

- Partial prerendering (PPR) for faster initial page loads
- Improved static/dynamic rendering balancing
- Enhanced prefetching strategies

These features are particularly relevant for the Justice Bus project's goal of functioning effectively in rural areas with connectivity challenges.

## 6. Implications for Tennessee Justice Bus Project

### 6.1 Current Infrastructure Alignment

The project's existing implementation using Next.js 14+ with App Router is well-aligned with Next.js 15's routing paradigms. No major refactoring is required, but several optimizations could be considered:

1. **Enhanced Loading States**: Implementing more granular loading.js files for better user feedback during network delays.
2. **Parallel Routes**: Consider implementing for the client dashboard to show case status alongside user profile information.
3. **Route Groups**: Better organize the project structure without changing URL paths.
4. **Intercepting Routes**: Improve user experience for document viewing and form editing.

### 6.2 Offline-First Considerations

Next.js 15's routing system works well with offline-first strategies through:

- Client-side caching of route data
- Optimistic UI updates with fallbacks
- Error boundaries for graceful degradation

The current project approach of using JWT-based authentication and local storage aligns well with these patterns.

### 6.3 Authentication Flow Improvements

The project's NextAuth.js implementation could benefit from:

- Enhanced middleware for more granular route protection
- Improved error handling for authentication failures
- Intercepting routes for smoother login/verification experiences

## 7. Next Steps

1. Consider updating to Next.js 15 to leverage the latest performance improvements and routing features
2. Implement more granular loading states using Suspense and loading.js
3. Review the current routing structure to identify opportunities for route groups and parallel routes
4. Enhance error handling at the route level with custom error.js files
5. Evaluate the authentication flow for potential improvements using intercepting routes

The core App Router architecture remains consistent between Next.js 14 and 15, so any enhancements can be implemented incrementally without risking overall application stability.
