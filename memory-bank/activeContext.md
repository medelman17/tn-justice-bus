# Active Context: Tennessee Justice Bus Pre-Visit Screening

**Date:** April 12, 2025 (Updated)

## 1. Current Focus

- **Initializing Project**: Setting up the foundational structure and documentation for the Tennessee Justice Bus Pre-Visit Screening application.
- **Memory Bank Initialization**: Creating the core Memory Bank documents (`projectBrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`) based on the provided project brief, PRD, and TDD.
- **GitHub Repository Setup**: Created a public GitHub repository for the project and pushed initial documentation.

## 2. Recent Changes

- **Memory Bank Creation**:
  - `projectBrief.md` was provided.
  - `productContext.md` created, outlining the 'why' and user goals.
  - `systemPatterns.md` created, detailing the JAMstack/Vercel architecture.
  - `techContext.md` created, listing the specific technologies and constraints.
  - This file (`activeContext.md`) created.
- **Repository Setup**:
  - Created new public GitHub repository at https://github.com/medelman17/tn-justice-bus
  - Added appropriate `.gitignore` file for Next.js projects
  - Pushed initial documentation and Memory Bank files

## 3. Immediate Next Steps

1.  ~~**Complete Memory Bank**: Create `progress.md` to establish the baseline project status.~~ ✓
2.  **Begin Phase 1 (Foundation)**:
    - Initialize the Next.js project structure in the repository
    - Set up the deployment on Vercel platform
    - Implement the core database schema in Vercel Postgres based on `justice-bus-tdd.md`.
    - Set up the authentication system using NextAuth.js.
    - Establish basic user management functionality.
    - Configure CI/CD pipeline via Vercel Git integration.

## 4. Active Decisions & Considerations

- **Technology Stack**: Confirmed commitment to Next.js 14+, Vercel platform (Postgres, KV, Blob), TypeScript, Tailwind CSS, Shadcn UI, NextAuth.js, and Claude AI.
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

_This document reflects the project state as of initialization._
