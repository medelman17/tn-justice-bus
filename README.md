# Tennessee Justice Bus Pre-Visit Client Screening Application

A Next.js application to enhance the Tennessee Justice Bus initiative by providing pre-visit client screening and preparation. This application helps maximize the impact of Justice Bus visits by improving client preparation and streamlining the intake process.

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
- **Database**: Vercel Postgres
- **Storage**: Vercel Blob Storage for document files
- **Caching**: Vercel KV (Redis) for session management and caching
- **AI**: Anthropic's Claude API for conversational assistance
- **Authentication**: NextAuth.js
- **Hosting**: Vercel Platform

## Key Features

1. **Virtual Intake Assistant**: Conversational interface using Claude AI
2. **Legal Issue Identifier**: Guided interview to identify specific legal issues
3. **Document Preparation Guide**: Customized checklists based on issue type
4. **Appointment Scheduler**: Integration with Justice Bus visit calendar
5. **Offline Capabilities**: Service worker for offline functionality

## Getting Started

### Prerequisites

- Node.js (v18+)
- PNPM (`npm install -g pnpm`)
- Git

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
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Authenticated user routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Core UI components
│   ├── forms/             # Form components
│   ├── intake/            # Intake flow components
│   ├── documents/         # Document management components
│   ├── scheduling/        # Appointment scheduling components
│   └── layout/            # Layout components
├── lib/
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── validation/        # Zod validation schemas
│   ├── db/                # Database client functions
│   ├── ai/                # AI integration functions
│   └── api/               # API client functions
└── styles/
    └── globals.css        # Global Tailwind styles
```

## Memory Bank Documentation

This project utilizes a Memory Bank system for comprehensive documentation. The following files in the `memory-bank/` directory provide detailed project context:

- `projectBrief.md`: Foundation document that defines core requirements and goals
- `productContext.md`: Details on why this project exists and problems it solves
- `systemPatterns.md`: Documents system architecture and key design patterns
- `techContext.md`: Details on technologies used and technical constraints
- `activeContext.md`: Captures current work focus and important patterns
- `progress.md`: Tracks what works, what's left to build, and current status

Refer to these documents for detailed project information and context.

## Development Phases

1. **Foundation** (Weeks 1-4): Project setup, database schema, authentication
2. **Core Features** (Weeks 5-8): Intake flow, document management, basic AI assistance
3. **Enhanced Features** (Weeks 9-12): Offline mode, advanced AI features, notifications
4. **Optimization & Testing** (Weeks 13-16): Performance, accessibility, comprehensive testing

## Contributing

_To be added once contribution guidelines are established_

## License

_To be added once licensing is determined_
