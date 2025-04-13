# Technical Context: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 14, 2025 (Updated - Testing Framework Implementation)

## 1. Core Technologies

The project is built primarily on the Vercel platform and Next.js framework. The following technologies have been established during project bootstrap:

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme configuration
- **Linting/Formatting**: ESLint (configured via eslint.config.mjs)
- **Hosting & Infrastructure**:
  - Vercel Platform (Serverless Functions, Edge Functions, CDN)
  - Vercel CLI for deployment management and environment configuration
- **Database**:
  - Supabase PostgreSQL (credentials configured)
  - Drizzle ORM for type-safe database interactions
- **Caching**: Vercel KV (Redis) (to be implemented)
- **Blob Storage**: Vercel Blob Storage (to be implemented)
- **AI**: Anthropic API (Claude) (to be implemented)

## 2. Frontend Stack

- **UI Library**:
  - Tailwind CSS for utility-based styling
  - Shadcn UI components for pre-built, accessible UI components
  - Radix UI primitives as the foundation for Shadcn UI
  - Custom theme configuration with CSS variables
- **State Management**:
  - Server State: React Query / SWR (TDD mentions both, need clarification, but likely one primary)
  - Client/Global State: React Context API
- **Form Management**:
  - React Hook Form for form state and validation
  - Zod for schema validation and type safety
  - Shadcn UI Form components for consistent styling and accessibility
- **Accessibility**:
  - Radix UI primitives for accessible component behaviors
  - Shadcn UI components with built-in accessibility features
  - Axe for testing, manual testing required
  - WCAG 2.1 AA target
- **PWA**: Service Workers, Manifest file, Offline caching strategies.

## 3. Backend Stack

- **Runtime**: Node.js (via Vercel Functions)
- **Authentication**:
  - NextAuth.js v5 with JWT-based authentication (no adapter needed)
  - JWT-based session management:
    - `strategy: "jwt"` configuration
    - 30-day session lifetime (`maxAge: 30 * 24 * 60 * 60`)
    - Custom JWT and session callbacks
    - Token includes user ID, email, phone, and timestamp data
  - Multiple authentication strategies using CredentialsProvider:
    - `phone-login` provider for phone-based authentication with code verification
    - `email-login` provider for email-based authentication with code verification
    - 6-digit verification code validation for both authentication methods
    - Consistent verification flow across authentication methods
  - Verification code storage:
    - Database-backed code storage with expiration timestamps
    - Support for both email and phone verification
    - Secure code generation and validation
    - Automatic cleanup of used or expired codes
  - Custom auth pages configuration:
    - `signIn: "/auth/signin"`
    - `signOut: "/auth/signout"`
    - `error: "/auth/error"`
    - `verifyRequest: "/auth/verify"`
  - Events handling for tracking login timestamps
  - Offline-ready token handling with secure local storage
- **API Style**: RESTful APIs via Next.js API Routes
- **Database Access**: Drizzle ORM with Supabase PostgreSQL

## 4. Key Third-Party Integrations

- **AI**: Anthropic API (Claude) - Requires careful prompt engineering and API key management (`ANTHROPIC_API_KEY`).
- **Scheduling**: Cal.com API (Planned) - For integrating with Justice Bus visit calendar.
- **Email**: Resend.com - For transactional emails (confirmations, reminders).
  - Configured with `EMAIL_SERVER` and `EMAIL_FROM` environment variables
  - Default sender address: "noreply@tnjusticebus.org"
- **SMS**: Knock - For text message notifications and workflows:
  - SMS verification code delivery
  - Appointment reminders (planned)
  - Status updates (planned)
- **Error Tracking**: Sentry - For real-time error monitoring.
- **Logging**: OpenTelemetry with Vercel Logging.

## 5. Development & Operations

- **Package Manager**: `pnpm` (implemented)
- **Project Structure**:
  - `/src/app` - Next.js App Router pages and layouts
    - `/src/app/auth` - Authentication-related pages and routes:
      - `/src/app/auth/signin` - Sign-in page with email and phone tabs
      - `/src/app/auth/signup` - Registration page
      - `/src/app/auth/verify` - Verification page for email and SMS codes
      - `/src/app/auth/error` - Error handling page for auth failures
    - `/src/app/api/auth` - Authentication API routes:
      - `/src/app/api/auth/[...nextauth]` - NextAuth.js handlers
      - `/src/app/api/auth/auth.ts` - Core NextAuth configuration
      - `/src/app/api/auth/register` - User registration endpoint
      - `/src/app/api/auth/verify-phone` - Phone verification endpoint
  - `/src/components` - Reusable UI components:
    - `/src/components/ui` - Shadcn UI components
    - `/src/app/auth/components` - Authentication-specific components:
      - `email-sign-in-form.tsx` - Email sign-in form component
      - `phone-sign-in-form.tsx` - Phone sign-in form component
      - `sign-up-form.tsx` - Registration form component
  - `/src/lib` - Utility functions and shared code:
    - `/src/lib/utils.ts` - General utilities including the `cn()` function for class merging
    - `/src/lib/db` - Database utilities and client
    - `/src/lib/events-offline.ts` - Offline storage for events data
    - `/src/lib/offline-utils.ts` - Utilities for offline functionality
  - `/src/test` - Testing utilities and configuration:
    - `/src/test/setup.ts` - Global test setup and utilities
    - `/src/test/README.md` - Testing documentation
    - `/src/lib/__tests__` - Unit tests for library functions
  - `/src/types` - Type definitions:
    - `/src/types/next-auth.d.ts` - TypeScript declarations for NextAuth.js
    - `/src/types/app.d.ts` - Application-specific type definitions
  - `/public` - Static assets (SVG files added)
  - `/tailwind.config.ts` - Tailwind configuration
  - `/components.json` - Shadcn UI configuration
- **Configuration Files**:
  - `next.config.ts` - Next.js configuration
  - `tsconfig.json` - TypeScript configuration
  - `postcss.config.mjs` - PostCSS configuration for Tailwind
  - `eslint.config.mjs` - ESLint configuration
  - `package.json` - Project dependencies and scripts
  - `vitest.config.ts` - Vitest testing configuration
- **Version Control**: Git with GitHub repository at https://github.com/medelman17/tn-justice-bus
- **CI/CD**:
  - Vercel Git Integration with GitHub connector (configured)
  - Automatic preview deployments for pull requests
  - Production deployments from main branch
  - Environment variables configured for staging and production
- **Testing**:
  - **Vitest**: Primary testing framework for unit and integration tests
    - Configuration with happy-dom for browser API testing
    - Miniflare for service worker testing
    - Support for testing offline functionality
    - Proper mocking utilities for IndexedDB and fetch
  - **Test Structure**:
    - Unit tests in `__tests__` directories near the code they test
    - Shared test utilities in `/src/test`
    - Testing isolation principles to avoid production dependencies
  - **Testing Scripts**:
    - `pnpm test` - Run all tests once
    - `pnpm test:watch` - Run tests in watch mode
    - `pnpm test:ui` - Open interactive test UI
    - `pnpm test:coverage` - Generate coverage reports
  - E2E: Playwright (to be implemented)
  - Accessibility: Axe, Manual testing (to be implemented)
  - Performance: Lighthouse (to be implemented)
- **Environment Variables**: Managed via Vercel dashboard, CLI, and `.env.local` for development:
  - NextAuth.js: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Email: `EMAIL_SERVER`, `EMAIL_FROM`
  - SMS (Knock): `KNOCK_API_KEY`, `KNOCK_SIGNING_KEY`
  - AI: `ANTHROPIC_API_KEY`
  - Development flags: `NODE_ENV`
- **Monitoring**:
  - Vercel Monitoring and Analytics dashboards (configured)
  - Vercel CLI for status checks and logs
  - Sentry (to be implemented)

## 6. Technical Constraints & Considerations

- **Offline First**: Application must function reliably with intermittent or no internet connectivity. This impacts:
  - Data storage (IndexedDB)
  - Asset caching
  - Token-based authentication persistence
  - Background synchronization logic
  - Graceful degradation of features
- **Low Bandwidth**: Optimize for slow connections (image optimization, code splitting, minimal data transfer).
- **Security**: High sensitivity of client data requires robust security measures (encryption, access controls, compliance with legal/ethical standards).
- **Accessibility**: Strict adherence to WCAG 2.1 AA is critical for serving users with diverse abilities.
- **AI Guardrails**: Claude integration must prevent providing legal advice and ensure information accuracy. Requires careful system prompt design and potentially human oversight mechanisms.
- **Scalability**: While starting as a POC, the architecture should support potential statewide expansion. Vercel's serverless nature aids this.

_This document is based on `projectBrief.md`, `justice-bus-tdd.md`, and `tn-justice-bus-prd.md` and has been updated after implementing the authentication system, UI components, and completing the Vercel deployment setup with CLI integration._
