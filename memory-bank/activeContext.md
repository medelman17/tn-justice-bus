# Active Context: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 12, 2025 (Updated - Knock SMS Implementation Guide)

## 1. Current Focus

- **~~Initializing Project~~**: ✓ Project foundation established with Next.js setup
- **~~Database Setup~~**: ✓ Successfully implemented Drizzle ORM with Supabase PostgreSQL
- **~~UI Component Library~~**: ✓ Installed and configured Shadcn UI components
- **~~Authentication System~~**: ✓ Implemented NextAuth.js with Supabase adapter, JWT sessions, email and phone authentication
- **~~Vercel Deployment~~**: ✓ Set up deployment via GitHub connector to Vercel with CLI access
- **~~User Dashboard~~**: ✓ Implemented responsive dashboard layout with user profile, case management, and statistics
- **~~Route Groups Implementation~~**: ✓ Implemented Next.js 15 Route Groups for improved code organization
- **Core Feature Implementation**: Building application foundation components
  - **Client Intake Forms**: Building intake forms for client information
  - **~~Offline Support~~**: ✓ Implemented robust offline capabilities with service workers
  - **~~Notification System~~**: ✓ Implemented Knock SMS notifications with offline support
- **Memory Bank Maintenance**: Keeping documentation aligned with project progress

## 2. Recent Changes

- **Next.js 15 Route Groups Implementation**:

  - Reorganized application routes using Next.js 15 Route Groups:
    - Created logical route groupings with `(auth)`, `(dashboard)`, and `(offline)` folders
    - Maintained original URL structure by creating subdirectories within route groups:
      - `(auth)/auth/` → `/auth/`
      - `(dashboard)/dashboard/` → `/dashboard/`
      - `(offline)/offline/` → `/offline/`
    - Resolved conflicts between parallel routes resolving to the same path
    - Migrated all components and files to appropriate locations in the new structure
    - Verified functionality of all routes and navigation
    - Created comprehensive documentation in `docs/route-groups-implementation.md`
    - Updated documentation index in `docs/README.md`
    - Updated memory bank files to reflect new structure
  - This implementation represents Phase 1 of our Next.js 15 routing features adoption
  - Planned for subsequent phases to include Promise-based props, loading/error UI, and parallel/intercepting routes

- **Mastra Implementation for Client Intake Forms**:

  - Completed comprehensive implementation documentation for Mastra AI agent framework:
    - Created detailed `mastra-implementation-guide.md` with code examples and architecture diagrams
    - Developed `mastra-system-integration-guide.md` for system integration details
    - Enhanced existing guides for Knock SMS and Serwist with Mastra integration details
  - Designed cost optimization strategies for Claude API usage:
    - Tiered model approach (Haiku for simple tasks, Sonnet for complex reasoning)
    - Context window management with summarization techniques
    - Prompt engineering optimizations and token usage reduction strategies
    - Caching and reuse system for common responses and legal information
    - Comprehensive usage monitoring and analytics dashboard
  - Architected system integration approach:
    - Direct embedding in Next.js application rather than separate service
    - API route integration with NextAuth for authentication
    - Seamless integration with Knock notification system
    - Case management linkage for intake data processing
    - Dashboard reporting for cost and usage monitoring
  - Designed offline-first implementation:
    - Vector database caching for offline knowledge retrieval
    - Workflow state persistence in IndexedDB
    - Background synchronization for completed intake forms
    - Service worker enhancements for Mastra-specific caching
    - Graceful degradation of AI capabilities when offline

- **Next.js Viewport Configuration Update**:

  - Fixed build warning about unsupported metadata themeColor in icon configuration
  - Moved themeColor from metadata export to viewport export in layout.tsx
  - Updated code to follow Next.js 14+ viewport API best practices
  - Successfully verified fix with production build

- **Knock SMS Notification Implementation**:

  - Implemented full Knock integration for SMS notifications with:
    - Core `knock.ts` utility with SDK integration
    - API routes for notification triggering and processing
    - `appointments.ts` utility for appointment-related notifications
    - Offline-compatible notification queuing system
  - Developed complete notification workflows for:
    - Authentication verification codes
    - Appointment reminders (scheduled and immediate)
    - Case status updates
  - Created testing interface for notifications:
    - `ApptNotificationTester` component in dashboard
    - Dedicated test page at `/dashboard/notifications-test`
    - Navigation link in dashboard sidebar
  - Integrated with service worker for offline support:
    - Notification queueing when offline
    - Automatic processing when online
    - Synchronization on visibility changes
  - Created comprehensive implementation guide in docs directory

- **Justice Bus Website Analysis**:

  - Scraped the existing Justice Bus website (https://justiceforalltn.org/justice-bus/) for background information
  - Key findings:
    - The Tennessee Justice Bus is a mobile law office initiative by the Tennessee Supreme Court Access to Justice Commission
    - The bus is equipped with technology like computers, tablets, printers, and internet access
    - It provides on-the-spot legal help in rural and underserved communities
    - The initiative includes upcoming legal clinics and events across various Tennessee counties
    - Attorneys can sign up for email notifications about volunteer opportunities
    - There's a YouTube video walkthrough of the Justice Bus interior

- **Home Page Implementation**:

  - Created a responsive landing page with modern design using Shadcn UI components
  - Implemented hero section with clear call-to-action buttons for sign-in and registration
  - Built features section highlighting key application capabilities (Virtual Intake Assistant, Legal Issue Identifier, Document Preparation, Appointment Scheduler)
  - Added "How It Works" section with step-by-step process explanation
  - Created "Upcoming Visits" section with cards showing Justice Bus locations and dates
  - Implemented impact statistics and testimonials section with tabbed interface
  - Added CTA section encouraging users to get started
  - Built comprehensive footer with resources, partners, and legal links
  - Ensured responsive design for all screen sizes with mobile-first approach
  - Fixed ESLint issues related to proper escaping of quotes and apostrophes

- **User Dashboard Implementation**:
  - Created responsive dashboard layout with collapsible sidebar navigation
  - Built main dashboard page with statistics cards, quick actions, and activity feed
  - Implemented user profile management with form editing capabilities
  - Created cases page with case cards, progress tracking, and filtering options
  - Added appropriate icons using Lucide React for improved UX
  - Implemented responsive design for mobile and desktop viewing
  - Added dark mode support with conditional styling
- **Memory Bank Creation and Updates**:
  - `projectBrief.md` was provided.
  - `productContext.md` created, outlining the 'why' and user goals.
  - `systemPatterns.md` created, detailing the JAMstack/Vercel architecture.
  - `techContext.md` created, listing the specific technologies and constraints.
  - This file (`activeContext.md`) created.
  - Created `archived/` directory for archiving implementation plans and documentation.
  - Documentation on Next.js 15 routing and Mastra integration moved to the docs directory as formal implementation guides.
- **Deployment Setup**:
  - Configured Vercel deployment through GitHub connector
  - Set up environment variables in Vercel dashboard
  - Created staging and production environments
  - Installed and configured Vercel CLI for local interaction with deployments
  - Documented deployment process in DEPLOYMENT.md
- **Technology Decisions**:
  - Selected Supabase PostgreSQL as the database provider (replacing Vercel Postgres)
  - Chose Knock for SMS notifications and messaging workflows (replacing Twilio)
  - Configured API keys and environment variables for both services
  - Implemented Drizzle ORM as the database interface layer with Supabase
- **Repository Setup**:
  - Created new public GitHub repository at https://github.com/medelman17/tn-justice-bus
  - Added appropriate `.gitignore` file for Next.js projects
  - Pushed initial documentation and Memory Bank files
- **Next.js Application Bootstrapped**:
  - Created Next.js 14+ project with TypeScript, Tailwind CSS, and ESLint
  - Set up proper directory structure with `/src` organization
  - Configured essential files (next.config.ts, tsconfig.json, postcss.config.mjs)
  - Added initial public assets
  - Created basic app layout structure
- **UI Component Library Setup**:
  - Installed and configured Shadcn UI components
  - Set up Tailwind configuration for the component system
  - Added CSS variables in globals.css for theming
  - Created components.json for Shadcn UI configuration
  - Installed all necessary UI components for authentication and main features
- **Authentication Implementation**:
  - Created complete authentication flows for email and phone-based sign-in
  - Implemented NextAuth.js with Supabase adapter integration
  - Built user registration with multiform sign-up
  - Added email and SMS verification processes
  - Created protected routes with middleware
  - Implemented offline-ready authentication with JWT-based session strategy
    - Token includes user ID, email, phone, and creation timestamp
    - 30-day session lifetime for extended offline usage
    - Secure token storage for offline authentication
  - Created Phone Number authentication using Credentials provider
    - 6-digit verification code validation
    - Automatic user creation for new phone numbers
    - Last login timestamp tracking on successful authentication
  - Added custom NextAuth callbacks for token and session management
  - Added user type definitions for improved type safety

## 3. Immediate Next Steps

1.  ~~**Complete Memory Bank**: Create `progress.md` to establish the baseline project status.~~ ✓
2.  ~~**Initialize Next.js Project**: Bootstrap the application with Next.js, TypeScript, and Tailwind CSS.~~ ✓
3.  ~~**Database Implementation**: Set up core database schema with Drizzle ORM and Supabase PostgreSQL.~~ ✓
4.  ~~**UI Component Library**: Install and configure Shadcn UI components.~~ ✓
5.  ~~**Authentication System**: Implement NextAuth.js with Supabase adapter and create sign-in/sign-up flows.~~ ✓
6.  **Continue Phase 1 (Foundation)**:
    - **~~User Dashboard~~** (Priority 1): ✓
      - ~~Create user dashboard layout with user profile information~~ ✓
      - ~~Add case overview and application status displays~~ ✓
      - ~~Implement settings management for user preferences~~ ✓
    - **~~Vercel Deployment~~** (Priority 2): ✓
      - ~~Configure GitHub connector for automatic deployment~~ ✓
      - ~~Set up environment variables in Vercel dashboard~~ ✓
      - ~~Deploy to staging environment for testing~~ ✓
    - **~~Offline Support~~** (Priority 3): ✓
      - ~~Enhance the current JWT-based offline authentication~~ ✓
      - ~~Add service worker for caching API requests~~ ✓
      - ~~Implement background synchronization for offline data~~ ✓
    - **~~Notification System~~** (Priority 4): ✓
      - ~~Document Knock SMS integration architecture~~ ✓
      - ~~Design SMS notification workflows~~ ✓
      - ~~Create offline-compatible notification system~~ ✓
      - ~~Implement SMS notification functionality~~ ✓
      - ~~Develop testing interface for notifications~~ ✓
      - ~~Ensure offline support for notifications~~ ✓

## 4. Active Decisions & Considerations

- **Technology Stack**: Confirmed commitment to Next.js 14+, Vercel platform (for deployment, KV, Blob), Supabase (for PostgreSQL database), Knock (for SMS), TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js, and Claude AI. Researched Next.js 15 routing features for potential future upgrade.
- **Deployment Workflow**: Using Vercel CLI for interacting with deployments, managing environment variables, and monitoring application status from the command line.
- **Package Manager**: Using `pnpm` as requested.
- **Architecture**: Adhering to the JAMstack and serverless patterns outlined in `systemPatterns.md`.
- **State Management**: Leaning towards React Query/SWR for server state, Context API for global UI state (needs final confirmation between React Query/SWR if both aren't used).
- **Development Team**: Currently a solo developer effort. Documentation and clear patterns are crucial.

## 5. Important Patterns & Preferences

- **Offline-First**: Design and implementation must prioritize functionality in low/no connectivity environments.
- **Accessibility (WCAG 2.1 AA)**: Non-negotiable requirement influencing UI/UX design and component implementation.
- **Security & Privacy**: High priority due to sensitive legal data. Follow best practices for encryption, access control, and data handling.
- **Clear AI Boundaries**: Ensure Claude AI provides information, not legal advice. Implement safeguards and clear user disclaimers.
- **Documentation-Driven**: Maintain the Memory Bank diligently as the single source of truth, especially given the solo developer context initially.

## 6. Learnings & Insights

- The project has well-defined goals and detailed technical/product requirements documented in `projectBrief.md`, `justice-bus-tdd.md`, and `tn-justice-bus-prd.md`.
- The Vercel ecosystem is central to the technical strategy.
- Addressing rural connectivity challenges (offline-first) is a core technical challenge.
- Balancing AI assistance with legal/ethical constraints is critical.
- Next.js 15's routing features (especially Error Handling, Loading States, and Intercepting Routes) align well with our offline-first requirements and could enhance the user experience in low-connectivity environments.
- Next.js 15 changes page component props from synchronous to Promise-based, which would require updating all existing page components during migration.

_This document reflects the project state after bootstrapping the Next.js application, implementing the authentication system, setting up Vercel deployment with CLI access, implementing the user dashboard interface with profile and case management, creating a responsive home page, researching Next.js 15 routing features, implementing robust offline capabilities with service workers, and implementing the Knock SMS notification system with offline support._
