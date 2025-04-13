# Route Groups Implementation

## Overview

This document explains the implementation of Next.js 15 Route Groups in the Tennessee Justice Bus application. Route groups provide a way to organize routes without affecting the URL path structure.

## Route Group Structure

We've implemented the following route groups:

```
src/app/
├── (auth)/               # Authentication route group
│   └── auth/             # Auth routes (maintains /auth URL path)
│       ├── components/   # Authentication components
│       ├── signin/       # Sign in page
│       ├── signup/       # Sign up page
│       └── verify/       # Verification page
├── (dashboard)/          # Dashboard route group
│   └── dashboard/        # Dashboard routes (maintains /dashboard URL path)
│       ├── cases/        # Case management
│       ├── profile/      # User profile
│       └── notifications-test/ # Notification testing
├── (offline)/            # Offline functionality route group
│   └── offline/          # Offline page (maintains /offline URL path)
├── api/                  # API routes (not in a route group)
└── page.tsx              # Root page
```

## Benefits of Route Groups

Route groups offer several advantages:

1. **Organization**: Related routes are grouped together in the file system
2. **Maintainability**: Easier to navigate and understand the codebase
3. **Shared Layouts**: Routes within a group can share layouts
4. **Clear Code Structure**: Logical separation of different parts of the application

## Implementation Notes

- Route groups use parentheses in their folder names: `(auth)`, `(dashboard)`, etc.
- The parentheses are stripped from the URL path, so for example, a file at `app/(auth)/auth/signin/page.tsx` will be accessible at `/auth/signin`.
- To maintain the original URL paths, we've created subdirectories inside the route groups:
  - `(auth)/auth/` → `/auth/`
  - `(dashboard)/dashboard/` → `/dashboard/`
  - `(offline)/offline/` → `/offline/`

## Next Steps for Next.js 15 Migration

This implementation represents Phase 1 of our Next.js 15 route features adoption. Subsequent phases will include:

1. **Phase 2**: Update page components to handle Promise-based props
2. **Phase 3**: Implement enhanced loading, error, and not-found UI components
3. **Phase 4**: Add parallel routes for dashboard components and intercepting routes for case details

## References

- [Next.js Route Groups Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js 15 Routing Guide](./nextjs15-routing-guide.md)
