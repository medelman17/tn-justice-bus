# Technical Context: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 12, 2025 (Updated - UI Components and Authentication Implementation)

## 1. Core Technologies

The project is built primarily on the Vercel platform and Next.js framework. The following technologies have been established during project bootstrap:

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme configuration
- **Linting/Formatting**: ESLint (configured via eslint.config.mjs)
- **Hosting & Infrastructure**: Vercel Platform (Serverless Functions, Edge Functions, CDN)
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
  - NextAuth.js with Supabase adapter
  - JWT-based session management
  - Multiple authentication strategies (Email/Password, SMS, Magic Link)
  - Offline-ready token handling with secure local storage
- **API Style**: RESTful APIs via Next.js API Routes
- **Database Access**: Drizzle ORM with Supabase PostgreSQL

## 4. Key Third-Party Integrations

- **AI**: Anthropic API (Claude) - Requires careful prompt engineering and API key management (`ANTHROPIC_API_KEY`).
- **Scheduling**: Cal.com API (Planned) - For integrating with Justice Bus visit calendar.
- **Email**: Resend.com - For transactional emails (confirmations, reminders).
- **SMS**: Knock - For text message notifications and workflows.
- **Error Tracking**: Sentry - For real-time error monitoring.
- **Logging**: OpenTelemetry with Vercel Logging.

## 5. Development & Operations

- **Package Manager**: `pnpm` (implemented)
- **Project Structure**:
  - `/src/app` - Next.js App Router pages and layouts
  - `/src/components` - Reusable UI components:
    - `/src/components/ui` - Shadcn UI components
    - `/src/app/auth/components` - Authentication-specific components
  - `/src/lib` - Utility functions and shared code:
    - `/src/lib/utils.ts` - General utilities including the `cn()` function for class merging
    - `/src/lib/db` - Database utilities and client
  - `/public` - Static assets (SVG files added)
  - `/tailwind.config.ts` - Tailwind configuration
  - `/components.json` - Shadcn UI configuration
- **Configuration Files**:
  - `next.config.ts` - Next.js configuration
  - `tsconfig.json` - TypeScript configuration
  - `postcss.config.mjs` - PostCSS configuration for Tailwind
  - `eslint.config.mjs` - ESLint configuration
  - `package.json` - Project dependencies and scripts
- **Version Control**: Git with GitHub repository at https://github.com/medelman17/tn-justice-bus
- **CI/CD**: Vercel Git Integration (to be configured)
- **Testing**:
  - Unit/Integration: Jest + React Testing Library (to be implemented)
  - E2E: Playwright (to be implemented)
  - Accessibility: Axe, Manual testing (to be implemented)
  - Performance: Lighthouse (to be implemented)
- **Environment Variables**: Managed via Vercel dashboard (e.g., `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `KNOCK_API_KEY`, API keys for Resend, Cal.com).
- **Monitoring**: Vercel Monitoring, Vercel Analytics, Sentry (to be implemented).

## 6. Technical Constraints & Considerations

- **Offline First**: Application must function reliably with intermittent or no internet connectivity. This impacts data storage (IndexedDB), asset caching, and synchronization logic.
- **Low Bandwidth**: Optimize for slow connections (image optimization, code splitting, minimal data transfer).
- **Security**: High sensitivity of client data requires robust security measures (encryption, access controls, compliance with legal/ethical standards).
- **Accessibility**: Strict adherence to WCAG 2.1 AA is critical for serving users with diverse abilities.
- **AI Guardrails**: Claude integration must prevent providing legal advice and ensure information accuracy. Requires careful system prompt design and potentially human oversight mechanisms.
- **Scalability**: While starting as a POC, the architecture should support potential statewide expansion. Vercel's serverless nature aids this.

_This document is based on `projectBrief.md`, `justice-bus-tdd.md`, and `tn-justice-bus-prd.md` and has been updated after bootstrapping the project._
