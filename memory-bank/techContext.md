# Technical Context: Tennessee Justice Bus Pre-Visit Screening

## 1. Core Technologies

The project is built primarily on the Vercel platform and Next.js framework.

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Hosting & Infrastructure**: Vercel Platform (Serverless Functions, Edge Functions, CDN)
- **Database**: Vercel Postgres
- **Caching**: Vercel KV (Redis)
- **Blob Storage**: Vercel Blob Storage
- **AI**: Anthropic API (Claude)

## 2. Frontend Stack

- **UI Library**: Tailwind CSS with Shadcn UI components (built on Radix UI primitives)
- **State Management**:
  - Server State: React Query / SWR (TDD mentions both, need clarification, but likely one primary)
  - Client/Global State: React Context API
- **Form Management**: React Hook Form + Zod for validation
- **Accessibility**: Radix UI primitives, Axe for testing, manual testing required. WCAG 2.1 AA target.
- **PWA**: Service Workers, Manifest file, Offline caching strategies.

## 3. Backend Stack

- **Runtime**: Node.js (via Vercel Functions)
- **Authentication**: NextAuth.js
- **API Style**: RESTful APIs via Next.js API Routes

## 4. Key Third-Party Integrations

- **AI**: Anthropic API (Claude) - Requires careful prompt engineering and API key management (`ANTHROPIC_API_KEY`).
- **Scheduling**: Cal.com API (Planned) - For integrating with Justice Bus visit calendar.
- **Email**: Resend.com - For transactional emails (confirmations, reminders).
- **SMS**: Twilio - For text message notifications.
- **Error Tracking**: Sentry - For real-time error monitoring.
- **Logging**: OpenTelemetry with Vercel Logging.

## 5. Development & Operations

- **Package Manager**: `pnpm` (as per user instruction)
- **Version Control**: Git (assumed, hosted likely on GitHub/GitLab/Bitbucket for Vercel integration)
- **CI/CD**: Vercel Git Integration (automatic builds, previews, deployments)
- **Testing**:
  - Unit/Integration: Jest + React Testing Library
  - E2E: Playwright
  - Accessibility: Axe, Manual testing
  - Performance: Lighthouse
- **Environment Variables**: Managed via Vercel dashboard (e.g., `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET`, API keys for Twilio, Resend, Cal.com).
- **Monitoring**: Vercel Monitoring, Vercel Analytics, Sentry.

## 6. Technical Constraints & Considerations

- **Offline First**: Application must function reliably with intermittent or no internet connectivity. This impacts data storage (IndexedDB), asset caching, and synchronization logic.
- **Low Bandwidth**: Optimize for slow connections (image optimization, code splitting, minimal data transfer).
- **Security**: High sensitivity of client data requires robust security measures (encryption, access controls, compliance with legal/ethical standards).
- **Accessibility**: Strict adherence to WCAG 2.1 AA is critical for serving users with diverse abilities.
- **AI Guardrails**: Claude integration must prevent providing legal advice and ensure information accuracy. Requires careful system prompt design and potentially human oversight mechanisms.
- **Scalability**: While starting as a POC, the architecture should support potential statewide expansion. Vercel's serverless nature aids this.

_This document is based on `projectBrief.md`, `justice-bus-tdd.md`, and `tn-justice-bus-prd.md`._
