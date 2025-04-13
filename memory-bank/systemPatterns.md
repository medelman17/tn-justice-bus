# System Patterns: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 13, 2025 (Updated - Justice Bus Events Implementation)

## 1. Core Architecture: JAMstack on Vercel

The application utilizes a modern JAMstack architecture, heavily leveraging Vercel's infrastructure and the Next.js framework. This approach prioritizes performance, scalability, and developer experience.

```mermaid
graph TD
    Client[Client Devices] --> Edge[Vercel Edge Network]
    Edge --> Frontend[Next.js Frontend (App Router)]
    Frontend --> API{API Routes / Server Components}
    API --> Middleware[Middleware (Auth, Logging)]
    Middleware --> API
    API --> Claude[Anthropic API (Claude)]
    API --> KV[Vercel KV (Redis)]
    API --> Supabase[Supabase PostgreSQL]
    API --> Blob[Vercel Blob Storage]
    API --> Knock[Knock SMS/Notifications]

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Edge fill:#ccf,stroke:#333,stroke-width:2px
    style Frontend fill:#ccf,stroke:#333,stroke-width:2px
    style API fill:#ccf,stroke:#333,stroke-width:2px
    style Middleware fill:#ccf,stroke:#333,stroke-width:2px
    style Claude fill:#fcf,stroke:#333,stroke-width:2px
    style KV fill:#cfc,stroke:#333,stroke-width:2px
    style Supabase fill:#cfc,stroke:#333,stroke-width:2px
    style Blob fill:#cfc,stroke:#333,stroke-width:2px
    style Knock fill:#fcf,stroke:#333,stroke-width:2px
```

## 2. Key Architectural Components & Patterns

1.  **Next.js App Router**: Enables server-centric routing, Server Components, and API routes within a unified framework.
    - **Route Groups**: Organizes routes logically without affecting URL structure:
      - `(auth)` groups authentication-related routes
      - `(dashboard)` groups dashboard-related features
      - `(offline)` groups offline functionality
      - Maintains original URL paths through subdirectories within groups
2.  **Serverless & Edge Functions**: Backend logic deployed as Vercel Serverless Functions (Node.js runtime) or Edge Functions for performance-critical tasks.
3.  **Infrastructure**:
    - **Supabase PostgreSQL**: Primary relational database for structured data (users, cases, appointments).
      - **JSONB Storage Pattern**: Used for flexible schema evolution in the Justice Bus Events system:
        - Single table with a JSONB column storing complex nested structures
        - Timestamp columns for tracking creation and updates
        - UUID primary keys for reliable identification
        - Avoids schema migrations for data model changes
        - Enables a single database table to store diverse complex objects
        - Allows for schema validation through Zod at the application layer
    - **Drizzle ORM**: Type-safe ORM layer for database interactions with Supabase PostgreSQL.
    - **Vercel KV (Redis)**: Used for session management caching frequently accessed data and potentially rate limiting.
    - **Vercel Blob Storage**: Secure storage for client-uploaded documents.
    - **Vercel Edge Network**: Global CDN for static assets and edge function execution.
    - **Knock**: SMS and notification platform for communications.
    - **Vercel CLI**: Command-line interface for managing Vercel deployments, environments, and configuration.
4.  **Component-Based UI**:
    - Frontend built with reusable React components using Shadcn UI component library
    - Follows a composition pattern where complex components are built from primitive UI components
    - Uses a consistent theming system with CSS variables for design tokens
    - Implements responsive design patterns with Tailwind's utility classes
5.  **API Layer**: RESTful APIs exposed via Next.js API routes (`/api/v1/...`).
6.  **Authentication**:
    - NextAuth.js with Supabase adapter for seamless integration with Supabase Auth
    - JWT-based session strategy optimized for offline support:
      - 30-day session lifetime for extended offline usage
      - Token includes user ID, email, phone, and creation timestamp (iat)
      - Custom JWT callback to maintain critical user data in the token
      - Secure token storage with encryption for offline authentication
    - Multiple authentication providers:
      - EmailProvider for email-based authentication with configurable server settings
      - CredentialsProvider for phone-based authentication with 6-digit code verification
      - Support for Magic Links through email workflow
    - User management:
      - Automatic user lookup by phone or email
      - New user creation for first-time authentication
      - Last login timestamp tracking on successful sign-in
    - Protected routes:
      - Role-based access control via Next.js middleware
      - Custom page redirects for authentication flows
      - Error handling for authentication failures
7.  **State Management**: Primarily using React Query for server state caching/synchronization, supplemented by React Context API for global UI state.
8.  **Form Handling**: Utilizing React Hook Form for efficient form state management and Zod for schema validation.
    - **Schema Validation Pattern**: Comprehensive validation for complex data structures:
      - Zod schema definitions that mirror database structures
      - Validation for nested objects, arrays, and primitive types
      - Type inference for TypeScript type safety
      - Custom validation rules for domain-specific constraints
      - Shared validation between client and server
9.  **Progressive Web App (PWA)**: Service workers, manifest, and caching strategies to enable offline functionality and installability.
    - **Offline-First IndexedDB Pattern**: Used for local data storage and synchronization:
      - Structured storage of complex data objects
      - Background synchronization when connectivity is restored
      - Online/offline state detection and appropriate UI feedback
      - Conflict resolution strategies
10. **AI Integration**:
    - Dedicated API routes (`/api/chat/intake`) to interact with the Anthropic API (Claude)
    - **Mastra Framework Pattern**: Structured AI agent framework for legal intake:
      - Properly typed agent definitions with `Agent` imported from "@mastra/core/agent"
      - Tool actions using Zod schema validation for input/output
      - Models typed as `ReturnType<typeof anthropic>` for type safety
      - Anthropic integration specifically with Claude 3 Sonnet model
      - Clear separation of agent configuration from implementation
    - Encapsulated prompt engineering and context management within agent definitions
11. **Deployment Strategy**:
    - GitHub integration with Vercel for continuous deployment
    - Automatic preview deployments for pull requests
    - Production deployment from main branch
    - Environment-based configuration with separate staging and production environments
    - Vercel CLI for local interaction with deployments and environment management

## 3. Data Flow Patterns

- **Events Data Flow**:

  - **Read Path**: Client requests events data -> Check online status -> If online, fetch from API and cache in IndexedDB -> If offline, retrieve from IndexedDB -> Render UI with appropriate offline indicators
  - **Write Path**: Client submits events data -> Check online status -> If online, send to API and update IndexedDB -> If offline, store in IndexedDB and queue for background sync -> Service worker processes sync queue when online

- **Authentication Flow**:
  - User initiates sign-in/sign-up -> Form validation with Zod -> API routes (/api/auth/...) -> NextAuth.js -> Supabase Auth/DB -> JWT generation -> Client-side storage
  - For phone authentication: Phone entry -> SMS code sent via Knock -> Code verification -> User creation/lookup -> JWT session
  - For email authentication: Email entry -> Magic link sent -> Link verification -> User creation/lookup -> JWT session
  - On successful authentication: Update last_login timestamp -> Generate session with user data -> Redirect to protected route
- **Client Intake**: Multi-step forms capture user data -> API routes -> Supabase PostgreSQL. AI assists via separate API calls.
- **Document Upload**: Client uploads file -> Frontend sends to API route -> API route streams to Vercel Blob Storage -> Stores URL/metadata in Supabase PostgreSQL.
- **Scheduling**: Client interacts with scheduling UI -> API calls to check availability (potentially integrating with Cal.com) -> Creates appointment record in Supabase PostgreSQL -> Sends notification via Knock.
- **Offline Sync**: Data entered offline stored locally (IndexedDB) -> Service worker detects connectivity -> Background sync pushes data to API routes.
- **Notifications**: Events (appointment confirmation, reminders, updates) -> API routes -> Knock workflows -> SMS delivery to clients.
- **Deployment Workflow**: Code changes -> GitHub repository -> Vercel build pipeline -> Preview/Production deployment -> Post-deployment verification.

## 4. Important Implementation Paths

- **Intake Flow**: A critical path involving complex state management, conditional logic based on user input, and AI interaction. Needs careful design for usability and offline resilience.
- **Document Handling**: Security and privacy are paramount. Ensure secure uploads, access control, and proper encryption.
- **AI Interaction**: Prompt engineering and context management are key to providing helpful, accurate, and safe assistance without giving legal advice. Requires careful boundary setting and potential human review loops.
- **Offline Strategy**: Implementing reliable offline data storage, caching, and background synchronization is crucial for rural usability.

_This document is based on `projectBrief.md`, `justice-bus-tdd.md`, implementation details from the authentication system, and the completed Vercel deployment setup._
