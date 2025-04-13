# Tennessee Justice Bus Pre-Visit Client Screening Application

A Next.js application to enhance the Tennessee Justice Bus initiative by providing pre-visit client screening and preparation. This application helps maximize the impact of Justice Bus visits by improving client preparation and streamlining the intake process, with a focus on rural areas that often have limited connectivity.

## Project Overview

The Tennessee Justice Bus brings free legal services to rural "legal deserts" across the state, where access to attorneys is severely limited. This application addresses key challenges:

- Only about 2% of attorneys practice in rural areas despite 14% of Americans living in rural communities
- 40% of US counties have fewer than 1 lawyer per 1,000 residents
- Many rural residents must travel hours to access basic legal services
- Limited time in each community during Justice Bus visits
- Unprepared clients require significant time for initial intake and issue identification

## Key Goals

- Increase the number of clients successfully served during Justice Bus visits by 30%
- Reduce time spent on initial intake and documentation gathering by 50%
- Ensure clients arrive at Justice Bus consultations with organized documentation
- Improve matching of client legal needs with appropriate volunteer attorneys
- Create a scalable solution that functions effectively in rural areas with connectivity challenges

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Vercel Serverless Functions
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob Storage for document files
- **Caching**: Vercel KV (Redis) for session management and caching
- **AI**: Anthropic's Claude API (Claude 3 Sonnet) with Mastra Framework
- **Authentication**: NextAuth.js v5 with edge compatibility
- **Notifications**: Knock SMS integration
- **Offline Support**: Serwist (modern Workbox fork) for service workers
- **Hosting**: Vercel Platform

## Key Features

1. **Virtual Intake Assistant**: Conversational interface using Claude AI with robust offline support
2. **Legal Issue Identifier**: Guided interview to identify specific legal issues
3. **Document Preparation Guide**: Customized checklists based on issue type
4. **Appointment Scheduler**: Integration with Justice Bus visit calendar and SMS notifications
5. **Offline-First Architecture**: Comprehensive offline capabilities with background synchronization
6. **Justice Bus Events Tracking**: Upcoming Justice Bus events with locations and details
7. **SMS Notifications**: Integrated SMS notifications for appointment reminders and updates

## User-Centered Design

The application is designed around the needs of four key user personas:

1. **Rural Tennessee Resident** - Primary end user with limited connectivity and legal knowledge
2. **Volunteer Attorney** - Legal professional with limited volunteer time who needs prepared clients
3. **Justice Bus Coordinator** - Program manager tracking metrics and organizing visits
4. **Community Partner** - Local facilitator connecting community members to services

These personas and their critical access patterns are comprehensively documented in `docs/user-personas-and-access-patterns.md`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PNPM (`npm install -g pnpm`)
- Git
- Supabase account (for database)
- Knock account (for SMS notifications)
- Anthropic API key (for Claude AI)

### Installation

```bash
# Clone the repository (URL will be added once repository is created)
git clone <repository-url>
cd tn-justice-bus-enhancement

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Update .env.local with your Vercel and Anthropic API keys

# Run the development server
pnpm dev
```

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/            # Authentication route group
│   │   └── auth/          # Auth pages (signin, signup, verify)
│   ├── (dashboard)/       # Dashboard route group
│   │   └── dashboard/     # Dashboard pages (profile, cases, events, intake)
│   ├── (offline)/         # Offline functionality route group
│   ├── api/               # API routes
│   ├── sw.ts              # Service Worker entry point
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── justice-bus/       # Justice Bus specific components
│   └── notifications/     # Notification components
├── db/
│   └── schema/            # Drizzle ORM schema definitions
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── knock.ts           # Knock SMS integration
│   ├── offline-utils.ts   # Offline functionality utilities
│   ├── events-offline.ts  # Offline events synchronization
│   ├── validators/        # Zod validation schemas
│   └── db/                # Database client
├── mastra/                # Mastra AI framework integration
│   ├── agents/            # AI agent definitions
│   ├── tools/             # AI tool definitions
│   └── workflows/         # Conversation workflows
└── types/                 # TypeScript type definitions
```

## Documentation

### Memory Bank

This project utilizes a Memory Bank system for comprehensive documentation. The following files in the `memory-bank/` directory provide detailed project context:

- `projectBrief.md`: Foundation document that defines core requirements and goals
- `productContext.md`: Details on why this project exists and problems it solves
- `systemPatterns.md`: Documents system architecture and key design patterns
- `techContext.md`: Details on technologies used and technical constraints
- `activeContext.md`: Captures current work focus and important patterns
- `progress.md`: Tracks what works, what's left to build, and current status

### Technical Implementation Guides

Detailed implementation guides are available in the `docs/` directory:

- `user-personas-and-access-patterns.md`: Comprehensive documentation of user personas and access patterns
- `serwist-implementation-guide.md`: Guide for offline functionality implementation
- `pwa-concepts-guide.md`: Overview of Progressive Web App implementation
- `knock-implementation-guide.md`: SMS notification system documentation
- `mastra-implementation-guide.md`: AI-powered client intake implementation
- `nextjs15-routing-guide.md`: Next.js 15 routing features implementation
- `nextauth-v5-migration-guide.md`: Authentication system migration guide
- `sms-verification-enhancement-guide.md`: Phone verification system documentation
- `route-groups-implementation.md`: Application route organization documentation

See `docs/README.md` for a complete documentation index and additional resources.

## Development Status

The project is currently in Phase 1 (Foundation) and has completed several key milestones:

✅ Project setup with Next.js, TypeScript, and Tailwind CSS  
✅ Database schema implementation with Drizzle ORM and Supabase PostgreSQL  
✅ Authentication system with NextAuth.js v5 and edge compatibility  
✅ Offline-first architecture using Serwist for service workers  
✅ User dashboard with profile and case management  
✅ Justice Bus events tracking system with offline support  
✅ SMS notification system with Knock integration  
✅ AI-powered client intake system with Mastra framework  
✅ Phone verification system with secure code storage

## Development Phases

1. **Foundation** (Weeks 1-4): Project setup, database schema, authentication, offline support (Current phase)
2. **Core Features** (Weeks 5-8): Intake flow, document management, AI assistance, scheduling
3. **Enhanced Features** (Weeks 9-12): Advanced offline capabilities, AI features, notifications, admin interface
4. **Optimization & Testing** (Weeks 13-16): Performance, accessibility, comprehensive testing, security audit

## Contributing

_To be added once contribution guidelines are established_

## License

_To be added once licensing is determined_
