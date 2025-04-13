# Active Context: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 13, 2025 (Updated - Justice Bus Events Implementation)

## 1. Current Focus

- **~~Initializing Project~~**: ✓ Project foundation established with Next.js setup
- **~~Database Setup~~**: ✓ Successfully implemented Drizzle ORM with Supabase PostgreSQL
- **~~UI Component Library~~**: ✓ Installed and configured Shadcn UI components
- **~~Authentication System~~**: ✓ Implemented NextAuth.js with Supabase adapter, JWT sessions, email and phone authentication
- **~~Vercel Deployment~~**: ✓ Set up deployment via GitHub connector to Vercel with CLI access
- **~~User Dashboard~~**: ✓ Implemented responsive dashboard layout with user profile, case management, and statistics
- **~~Route Groups Implementation~~**: ✓ Implemented Next.js 15 Route Groups for improved code organization
- **~~Authentication Upgrade~~**: ✓ Successfully migrated to NextAuth.js v5 with edge compatibility
- **~~Justice Bus Events~~**: ✓ Implemented events tracking system with flexible JSONB storage, validation, and offline support
- **Core Feature Implementation**: Building application foundation components
  - **~~Client Intake System~~**: ✓ Implemented AI-powered client intake with Mastra framework
  - **~~Offline Support~~**: ✓ Implemented robust offline capabilities with service workers
  - **~~Notification System~~**: ✓ Implemented Knock SMS notifications with offline support
- **Memory Bank Maintenance**: Keeping documentation aligned with project progress

## 2. Recent Changes

- **User Personas and Access Patterns Documentation**:

  - Created comprehensive documentation defining key user personas and access patterns:
    - Developed detailed persona profiles for four key user types:
      - Rural Tennessee Resident (primary end user)
      - Volunteer Attorney
      - Justice Bus Coordinator
      - Community Partner
    - Defined key characteristics, needs, and metrics for each persona
    - Mapped out five critical access patterns:
      - Pre-Visit Client Preparation
      - Appointment Management
      - Legal Issue Assessment
      - Post-Visit Follow-up
      - Program Management and Reporting
    - Documented technical considerations for each access pattern
    - Created implementation status tracking for each feature area
    - Added next steps for ongoing development
    - Outlined core implementation considerations for:
      - Offline-First Implementation
      - Accessibility Implementation
      - Security Implementation
      - Rural-Specific Considerations
    - Added priority matrix for future development planning
  - Integrated documentation with existing docs structure:
    - Updated `docs/README.md` to include the new documentation
    - Added detailed description to the documentation index
    - Created "Getting Started" section in the README for understanding user needs
  - This documentation serves as a foundation for ensuring all development efforts align with the needs of rural Tennessee residents and other key stakeholders

- **Client Intake System Implementation**:

  - Implemented AI-powered legal intake system using Mastra framework:
    - Created `src/mastra` directory structure with agents, tools, and workflows
    - Implemented legal intake agent with Claude 3 Sonnet model integration
    - Built intake workflow for guided legal issue identification and document preparation
    - Created detailed issue type categorization system (housing, family, consumer, benefits, employment)
    - Implemented document recommendations based on legal issue type
    - Developed urgency assessment system for prioritizing critical cases
  - Created conversational UI components for intake system:
    - Implemented `ClientIntake` component with responsive chat interface
    - Added offline detection and status indicators
    - Created special message formatting for document lists and recommendations
    - Built streaming response handling for improved user experience
    - Added loading indicators and error handling
  - Developed API endpoints for AI integration:
    - Created `/api/chat/intake` route for communication with Mastra agent
    - Implemented secure message handling with auth checks
    - Added streaming response capabilities
    - Built proper error handling and status codes
  - Added new intake process to dashboard:
    - Created `/dashboard/intake` page with detailed instructions
    - Updated dashboard navigation to include Legal Intake link
    - Integrated with existing UI components and styles
  - Implemented proper environment setup:
    - Added necessary dependencies (ai@4.2.0, @ai-sdk/anthropic, @mastra/core)
    - Configured proper imports and API keys

- **Justice Bus Events Implementation**:

  - Implemented comprehensive Justice Bus events tracking system based on detailed JSON schema
  - Created database schema for events using Drizzle ORM with JSONB storage for flexible schema evolution:
    - Used a single table with a JSONB column for storing the entire event data structure
    - Included proper timestamp columns for tracking creation and updates
    - Implemented database migration using Drizzle Kit
  - Built API endpoints for event management:
    - Created `/api/events` GET endpoint for retrieving events data
    - Added POST endpoint for creating and updating events
  - Implemented comprehensive validation using Zod:
    - Created detailed schema validation in `src/lib/validators/justice-bus-events.ts`
    - Defined types and validation for nested structures like location information and GIS data
    - Added proper validation for event types, statuses, and other enumerated values
  - Developed robust offline-first capabilities:
    - Created IndexedDB storage for caching events data in `src/lib/events-offline.ts`
    - Implemented background synchronization for offline changes
    - Added event listeners for online/offline status changes
    - Integrated with existing service worker infrastructure
  - Built responsive UI components:
    - Created `JusticeBusEventsList` component for displaying events
    - Added events page at `/dashboard/events`
    - Integrated with dashboard navigation
    - Implemented loading, error, and empty states
    - Added offline indicators and warnings
  - Updated dashboard layout to include Events navigation link

- **NextAuth.js v5 Migration Implementation**:

  - Successfully migrated from NextAuth.js v4 to v5 beta
  - Implemented a split configuration approach for edge compatibility:
    - Created `auth.config.ts` with edge-compatible code for middleware
    - Created `auth.ts` with full Supabase adapter integration
  - Updated middleware to use direct cookie checking without edge-incompatible dependencies
  - Added support for both old and new cookie formats during transition
  - Fixed type issues with session and token handling for stricter typing
  - Added environment variable fallbacks for both AUTH* and NEXTAUTH* prefixes
  - Updated documentation with detailed migration summary
  - Created comprehensive rollback plan in case of future issues
  - Successfully tested all authentication flows after migration

- **NextAuth.js v5 Migration Planning**:

  - Analyzed new features and breaking changes in NextAuth.js v5
  - Developed a comprehensive migration strategy focused on:
    - Edge compatibility with a split configuration approach
    - Universal `auth()` function for all authentication contexts
    - Updated package dependencies and adapter imports
    - Consistent environment variable management
  - Created detailed implementation guide with:
    - Step-by-step migration instructions
    - Code examples for all required changes
    - Testing strategies and troubleshooting tips
    - Rollback plan for risk mitigation
  - Added the migration plan to the docs directory as `nextauth-v5-migration-guide.md`
  - Updated the documentation index in `docs/README.md`

- **SMS Verification Enhancement Implementation**:

  - Implemented comprehensive SMS verification system with secure code storage and offline support:
    - Created `verification_codes` database table with proper expiration timestamps
    - Implemented database schema migration with Drizzle ORM
    - Added the table to schema index for database operations
  - Built secure API endpoint for code generation and verification:
    - Created `/api/auth/send-verification` endpoint with rate limiting (5 attempts per hour)
    - Implemented cryptographically secure 6-digit code generation
    - Ensured old codes are deleted when requesting new ones
    - Added proper error handling and status codes
  - Enhanced authentication system to use database-stored verification codes:
    - Updated both auth.ts and auth.config.ts for stricter code validation
    - Implemented code verification against database with expiration check
    - Added automatic code deletion after successful verification to prevent reuse
    - Fixed type issues with token and session handling
  - Created robust offline support framework:
    - Implemented `offline-verification.ts` module for offline code handling
    - Added storage for verification attempts when offline
    - Implemented automatic sync when connection is restored
    - Integrated with existing offline utilities system
  - Enhanced UI components for improved user experience:
    - Updated phone sign-in form with offline status indicators
    - Added warning/error variant to Alert component for better visual feedback
    - Added resend code functionality for better UX
    - Implemented proper error message handling with HTML escaping
    - Added informative expiration messages (10-minute timeout)

- **SMS Verification Enhancement Planning**:

  - Analyzed current phone verification implementation
  - Designed a production-ready verification code system that:
    - Stores verification codes in the database with expiration
    - Integrates with the existing Knock SMS notification service
    - Implements proper security measures and rate limiting
    - Maintains offline-first compatibility
  - Created detailed implementation guide with:
    - Database schema for verification codes
    - API routes for code generation and verification
    - Enhanced UI components for the verification flow
    - Security considerations and testing strategies
  - Added the enhancement plan to the docs directory as `sms-verification-enhancement-guide.md`
  - Updated the documentation index in `docs/README.md`

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

- **Home Page Implementation and UI Refinement**:

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
  - Refined UI for "How We Help You Prepare" features section:
    - Replaced standard cards with modern, interactive card components
    - Added top accent bars in primary color for visual hierarchy
    - Implemented rounded icon backgrounds with subtle color treatment
    - Added hover effects (elevation and shadow) for better interactivity
    - Added prominent call-to-action button below features
    - Applied consistent vertical spacing and alignment
  - Enhanced Impact statistics section:
    - Fixed centering issues in statistic cards
    - Implemented flex layout with proper justify-center and items-center
    - Set consistent min-height for uniform card sizing
    - Added padding and max-width constraints for properly centered text
    - Created a simplified card structure for better responsiveness

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
    - **~~Authentication Upgrade~~** (Priority 5): ✓
      - ~~Migrate to NextAuth.js v5 using edge-compatible split configuration~~ ✓
      - ~~Update API routes and middleware with universal auth() function~~ ✓
      - ~~Replace adapter imports with new package names~~ ✓
      - ~~Update environment variables with new AUTH\_ prefix~~ ✓
      - ~~Thoroughly test authentication flows after migration~~ ✓
    - **~~Justice Bus Events~~** (Priority 6): ✓
      - ~~Implement database schema for event tracking~~ ✓
      - ~~Create API endpoints for event management~~ ✓
      - ~~Build validation layer with Zod~~ ✓
      - ~~Add offline support for events data~~ ✓
      - ~~Create UI components for displaying events~~ ✓
      - ~~Integrate with dashboard~~ ✓
    - **~~SMS Verification Enhancement~~** (Priority 7): ✓
      - ~~Implement database schema for verification codes~~ ✓
      - ~~Create API routes for code generation and verification~~ ✓
      - ~~Enhance verification UI components~~ ✓
      - ~~Add rate limiting and security measures~~ ✓
      - ~~Integrate with Knock SMS system~~ ✓
      - ~~Test verification flows thoroughly~~ ✓

## 4. Active Decisions & Considerations

- **Technology Stack**: Confirmed commitment to Next.js 14+, Vercel platform (for deployment, KV, Blob), Supabase (for PostgreSQL database), Knock (for SMS), TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js, and Claude AI. Researched Next.js 15 routing features and NextAuth.js v5 for future upgrades.
- **Authentication System**: Successfully migrated to NextAuth.js v5 with edge compatibility using split configuration approach that maintains database adapter functionality while ensuring middleware compatibility.
- **Verification System Enhancement**: Planning to improve the SMS verification system with secure code storage, proper integration with Knock, and enhanced security measures.
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
- **Edge Compatibility**: Ensure critical components like authentication middleware can run in edge environments for optimal performance.

## 6. Learnings & Insights

- The project has well-defined goals and detailed technical/product requirements documented in `projectBrief.md`, `justice-bus-tdd.md`, and `tn-justice-bus-prd.md`.
- The Vercel ecosystem is central to the technical strategy.
- Addressing rural connectivity challenges (offline-first) is a core technical challenge.
- Balancing AI assistance with legal/ethical constraints is critical.
- Next.js 15's routing features (especially Error Handling, Loading States, and Intercepting Routes) align well with our offline-first requirements and could enhance the user experience in low-connectivity environments.
- Next.js 15 changes page component props from synchronous to Promise-based, which would require updating all existing page components during migration.
- NextAuth.js v5 introduces significant architectural changes that improve edge compatibility but require careful migration planning, which we have now successfully implemented.
- The split configuration approach for NextAuth.js v5 successfully addresses the edge compatibility requirements while maintaining database adapter functionality.
- The current SMS verification approach works for development but needs enhancement for production security.

_This document reflects the project state after bootstrapping the Next.js application, implementing the authentication system, setting up Vercel deployment with CLI access, implementing the user dashboard interface with profile and case management, creating a responsive home page, researching Next.js 15 routing features, implementing robust offline capabilities with service workers, implementing the Knock SMS notification system with offline support, successfully migrating to NextAuth.js v5 with edge compatibility, and creating detailed implementation plans for SMS verification enhancement._
