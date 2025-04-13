# NextAuth.js v5 Migration Summary

This document summarizes the changes made to implement NextAuth.js v5 (beta) in the Tennessee Justice Bus application.

## Key Changes

### 1. Split Configuration Approach

NextAuth.js v5 introduces a split configuration approach for better edge compatibility:

- `auth.config.ts` - Contains edge-compatible code used by middleware
- `auth.ts` - Contains the full configuration with database adapter

### 2. Updated Environment Variables

NextAuth.js v5 uses the `AUTH_` prefix instead of `NEXTAUTH_`:

- `AUTH_SECRET` replaces `NEXTAUTH_SECRET`
- `AUTH_URL` replaces `NEXTAUTH_URL`

Our implementation supports both formats during the transition period, with fallbacks in the code:

```typescript
secret: process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-only-secret";
```

### 3. Modified API Routes

- Replaced `/pages/api/auth/[...nextauth].ts` with `/app/api/auth/[...nextauth]/route.ts`
- Implemented using the new handlers from the split configuration

### 4. Custom Middleware

- Updated middleware to use direct cookie checking for edge compatibility
- Supports both old and new cookie formats during transition:
  - `next-auth.session-token` (old)
  - `authjs.session-token` (new)

### 5. Client-Side Changes

- Updated imports from `next-auth/react` to reference new functions
- Added types for improved type safety

## Troubleshooting Tips

The most common issues encountered during NextAuth.js v5 migration:

1. **Edge Compatibility**: Some dependencies like nodemailer aren't edge-compatible. We've addressed this by using the split configuration pattern.

2. **Type Errors**: The new version is more strict with types. We've updated type definitions in `next-auth.d.ts` to address these.

3. **Session Data**: Changed how session data is accessed in some components, especially for custom user fields like `phone`.

4. **Cookie Changes**: The cookie prefix changed from `next-auth` to `authjs`, requiring middleware updates to support both.

## Rollback Plan

If issues arise with the NextAuth.js v5 implementation, follow these steps:

1. Restore the previous files from version control:

   - `src/app/api/auth/auth.ts`
   - `src/app/api/auth/[...nextauth]/route.ts`
   - `src/middleware.ts`

2. Remove the new configuration files:

   - `auth.config.ts`
   - `auth.ts`

3. Ensure legacy environment variables are correctly set.

## References

- [NextAuth.js v5 Migration Guide](https://authjs.dev/guides/upgrade-to-v5)
- [NextAuth.js v5 Split Configuration Documentation](https://authjs.dev/guides/upgrade-to-v5/edge-compatibility)
