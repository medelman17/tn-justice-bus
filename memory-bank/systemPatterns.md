# System Patterns: Tennessee Justice Bus Pre-Visit Screening

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
    API --> Postgres[Vercel Postgres]
    API --> Blob[Vercel Blob Storage]

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Edge fill:#ccf,stroke:#333,stroke-width:2px
    style Frontend fill:#ccf,stroke:#333,stroke-width:2px
    style API fill:#ccf,stroke:#333,stroke-width:2px
    style Middleware fill:#ccf,stroke:#333,stroke-width:2px
    style Claude fill:#fcf,stroke:#333,stroke-width:2px
    style KV fill:#cfc,stroke:#333,stroke-width:2px
    style Postgres fill:#cfc,stroke:#333,stroke-width:2px
    style Blob fill:#cfc,stroke:#333,stroke-width:2px
```

## 2. Key Architectural Components & Patterns

1.  **Next.js App Router**: Enables server-centric routing, Server Components, and API routes within a unified framework.
2.  **Serverless & Edge Functions**: Backend logic deployed as Vercel Serverless Functions (Node.js runtime) or Edge Functions for performance-critical tasks.
3.  **Vercel Infrastructure**:
    - **Postgres**: Primary relational database for structured data (users, cases, appointments).
    - **KV (Redis)**: Used for session management, caching frequently accessed data, and potentially rate limiting.
    - **Blob Storage**: Secure storage for client-uploaded documents.
    - **Edge Network**: Global CDN for static assets and edge function execution.
4.  **Component-Based UI**: Frontend built with reusable React components (Shadcn UI library over Tailwind CSS).
5.  **API Layer**: RESTful APIs exposed via Next.js API routes (`/api/v1/...`).
6.  **Authentication**: Handled by NextAuth.js, managing sessions and protecting routes.
7.  **State Management**: Primarily using React Query for server state caching/synchronization, supplemented by React Context API for global UI state.
8.  **Form Handling**: Utilizing React Hook Form for efficient form state management and Zod for schema validation.
9.  **Progressive Web App (PWA)**: Service workers, manifest, and caching strategies to enable offline functionality and installability.
10. **AI Integration**: Dedicated API routes (`/api/v1/ai/...`) to interact with the Anthropic API (Claude), encapsulating prompt engineering and context management.

## 3. Data Flow Patterns

- **Client Intake**: Multi-step forms capture user data -> API routes -> Vercel Postgres. AI assists via separate API calls.
- **Document Upload**: Client uploads file -> Frontend sends to API route -> API route streams to Vercel Blob Storage -> Stores URL/metadata in Vercel Postgres.
- **Scheduling**: Client interacts with scheduling UI -> API calls to check availability (potentially integrating with Cal.com) -> Creates appointment record in Vercel Postgres.
- **Offline Sync**: Data entered offline stored locally (IndexedDB) -> Service worker detects connectivity -> Background sync pushes data to API routes.

## 4. Important Implementation Paths

- **Intake Flow**: A critical path involving complex state management, conditional logic based on user input, and AI interaction. Needs careful design for usability and offline resilience.
- **Document Handling**: Security and privacy are paramount. Ensure secure uploads, access control, and proper encryption.
- **AI Interaction**: Prompt engineering and context management are key to providing helpful, accurate, and safe assistance without giving legal advice. Requires careful boundary setting and potential human review loops.
- **Offline Strategy**: Implementing reliable offline data storage, caching, and background synchronization is crucial for rural usability.

_This document is based on `projectBrief.md` and `justice-bus-tdd.md`._
