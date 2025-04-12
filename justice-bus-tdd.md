# Technical Design Document
## Tennessee Justice Bus Pre-Visit Client Screening Application

**Document Version:** 1.0  
**Last Updated:** April 12, 2025  
**Document Owner:** Tennessee Access to Justice Technical Team

## 1. Introduction

This Technical Design Document (TDD) outlines the architecture, technical specifications, and implementation details for the Tennessee Justice Bus Pre-Visit Client Screening Application. The application will be built using Vercel's suite of products and integrations, with a focus on creating a scalable, accessible, and performant solution that works effectively in rural areas with limited connectivity.

## 2. System Architecture

### 2.1 High-Level Architecture

The application will follow a modern JAMstack architecture leveraging Vercel's infrastructure and Next.js framework:

```
┌─────────────────────────────────────────────────┐
│                  Client Devices                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│                 Vercel Edge Network              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Next.js Application (Frontend)        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌──────────────────────┐   ┌─────────────────────┐
│   API Routes/Server   │◄──┤  Middleware Layer   │
│      Components       │   │  (Auth, Logging)    │
└──────────┬───────────┘   └─────────────────────┘
           │
           ▼
┌──────────────────────┐   ┌─────────────────────┐
│  Anthropic API       │   │   Vercel KV Store    │
│  (Claude AI)         │   │   (Redis)            │
└──────────────────────┘   └─────────────────────┘
           │                         │
           │                         │
           ▼                         ▼
┌──────────────────────┐   ┌─────────────────────┐
│  Vercel Postgres     │   │  Vercel Blob Storage │
│  (User/Case Data)    │   │  (Documents)         │
└──────────────────────┘   └─────────────────────┘
```

### 2.2 Key Components

1. **Next.js Application**: The core application built with Next.js 14+
2. **Vercel Edge Network**: For global content delivery and edge functions
3. **Vercel Postgres**: Primary database for structured data
4. **Vercel KV (Redis)**: For caching and session management
5. **Vercel Blob Storage**: For secure document storage
6. **Anthropic API**: For Claude AI integration
7. **Next Auth**: For authentication and authorization

## 3. Technology Stack

### 3.1 Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query + Context API
- **Form Management**: React Hook Form with Zod validation
- **Accessibility**: Radix UI primitives + custom a11y implementations

### 3.2 Backend

- **Runtime**: Node.js (Vercel Serverless Functions / Edge Functions)
- **Database**: Vercel Postgres (PostgreSQL)
- **Caching**: Vercel KV (Redis)
- **Storage**: Vercel Blob Storage
- **Authentication**: NextAuth.js
- **AI Integration**: Anthropic API (Claude)
- **Analytics**: Vercel Analytics

### 3.3 DevOps & Infrastructure

- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration Pipeline
- **Monitoring**: Vercel Monitoring + Sentry
- **Testing**: Jest, React Testing Library, Playwright
- **Environment Management**: Vercel Environment Variables

### 3.4 Third-Party Integrations

- **Calendar**: Cal.com API for appointment scheduling
- **Notifications**: Resend.com for transactional emails
- **SMS**: Twilio for text notifications
- **Logging**: OpenTelemetry with Vercel Logging

## 4. Database Schema

### 4.1 Core Entities

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  preferred_language VARCHAR(20) DEFAULT 'en',
  household_size INT,
  income_bracket VARCHAR(50),
  accessibility_needs TEXT,
  preferred_contact_method VARCHAR(20) DEFAULT 'email'
);
```

#### Cases Table
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  urgency_level VARCHAR(20) DEFAULT 'normal',
  intake_completed BOOLEAN DEFAULT FALSE,
  documents_ready BOOLEAN DEFAULT FALSE,
  appointment_id UUID,
  assigned_attorney_id UUID,
  county VARCHAR(100) NOT NULL,
  intake_data JSONB,
  referral_source VARCHAR(100)
);
```

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  blob_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  document_type VARCHAR(100) NOT NULL,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  justice_bus_visit_id UUID NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reminder_sent BOOLEAN DEFAULT FALSE
);
```

#### Justice Bus Visits Table
```sql
CREATE TABLE justice_bus_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  county VARCHAR(100) NOT NULL,
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_slots INT NOT NULL,
  booked_slots INT DEFAULT 0,
  case_types_served VARCHAR[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'scheduled'
);
```

### 4.2 Additional Tables

#### Intake Questions Table
```sql
CREATE TABLE intake_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_type VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT FALSE,
  display_order INT NOT NULL,
  conditional_logic JSONB,
  help_text TEXT
);
```

#### Document Requirements Table
```sql
CREATE TABLE document_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_type VARCHAR(100) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  importance VARCHAR(20) DEFAULT 'recommended',
  help_text TEXT,
  alternative_documents TEXT
);
```

## 5. API Design

### 5.1 API Routes Structure

The application will use Next.js API routes organized by resource:

```
/api/v1/users
/api/v1/cases
/api/v1/documents
/api/v1/appointments
/api/v1/justice-bus-visits
/api/v1/intake
/api/v1/ai/assist
```

### 5.2 Authentication Routes

Authentication will be handled through NextAuth.js with the following routes:

```
/api/auth/signin
/api/auth/signout
/api/auth/session
/api/auth/callback
```

### 5.3 Key API Endpoints

#### User Management
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user information

#### Case Management
- `POST /api/v1/cases` - Create a new case
- `GET /api/v1/cases/:id` - Get case details
- `PUT /api/v1/cases/:id` - Update case information
- `GET /api/v1/users/:userId/cases` - Get all cases for a user

#### Intake Process
- `GET /api/v1/intake/questions/:caseType` - Get intake questions for case type
- `POST /api/v1/intake/submit` - Submit intake responses
- `GET /api/v1/intake/document-requirements/:caseType` - Get document requirements

#### Document Management
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents/:id` - Get document metadata
- `GET /api/v1/documents/download/:id` - Download document
- `GET /api/v1/cases/:caseId/documents` - Get all documents for a case

#### Appointment Scheduling
- `GET /api/v1/justice-bus-visits` - Get upcoming Justice Bus visits
- `POST /api/v1/appointments` - Create an appointment
- `PUT /api/v1/appointments/:id` - Update an appointment
- `DELETE /api/v1/appointments/:id` - Cancel an appointment

#### Claude AI Assistant
- `POST /api/v1/ai/assist` - Get AI assistance for a question
- `POST /api/v1/ai/analyze-case` - Analyze case information

## 6. Frontend Architecture

### 6.1 Application Structure

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
├── styles/
│   └── globals.css        # Global Tailwind styles
├── types/                 # TypeScript type definitions
├── middleware.ts          # Next.js middleware
└── config/                # Application configuration
```

### 6.2 Key Pages

1. **Landing Page** - Public information and initial screening
2. **Authentication Pages** - Sign up, sign in, password reset
3. **Intake Flow** - Multi-step intake process
4. **Document Upload** - Document management interface
5. **Scheduling Interface** - Justice Bus appointment booking
6. **Dashboard** - Case status and next steps
7. **Case Details** - Detailed case information and documentation
8. **Profile Management** - User profile and preferences

### 6.3 Progressive Web App (PWA) Features

The application will be implemented as a PWA with:

- Service worker for offline capability
- Manifest for installability
- Offline data caching with SWR/React Query
- Background sync for form submissions
- Push notifications for appointment reminders

## 7. AI Integration Design

### 7.1 Claude AI Integration Points

The application will integrate Claude AI at several key touchpoints:

1. **Guided Intake Assistance** - Help users through intake forms
2. **Document Requirement Explanation** - Explain why specific documents are needed
3. **Legal Issue Classification** - Identify and categorize legal issues
4. **Question Answering** - Provide basic legal information
5. **Appointment Preparation** - Help users prepare for their appointment

### 7.2 Claude Implementation

Claude will be integrated via the Anthropic API with a specialized prompt framework:

```typescript
type ClaudePrompt = {
  system: string;  // System prompt with TN-specific legal context
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};
```

System prompts will be carefully crafted with Tennessee-specific legal information and clear boundaries to avoid providing legal advice.

### 7.3 AI Safety & Oversight

1. **Human Review Pipeline** - Response monitoring system for quality assurance
2. **Confidence Thresholds** - Escalation to human review for low-confidence responses
3. **Legal Information Boundaries** - Clear demarcation between information and advice
4. **Continuous Improvement** - Feedback loop for refining responses

## 8. Security & Compliance

### 8.1 Authentication & Authorization

- Email/phone authentication with NextAuth.js
- JWT-based session management
- Role-based access control
- Multi-factor authentication option

### 8.2 Data Protection

- All data encrypted at rest using Vercel Postgres encryption
- All data encrypted in transit (TLS 1.3)
- Document encryption in Vercel Blob Storage
- Automatic data retention policies

### 8.3 Legal & Ethical Compliance

- Clear disclaimers throughout the application
- WCAG 2.1 AA accessibility compliance
- Audit logging for all system actions
- Data minimization principles applied

## 9. Offline & Low-Connectivity Support

### 9.1 Progressive Enhancement

The application will be built with progressive enhancement principles:

1. Core functionality works without JavaScript
2. Enhanced experience with JavaScript enabled
3. Fully-featured experience with reliable connectivity

### 9.2 Offline Capabilities

- IndexedDB storage for offline form data
- Service worker for caching critical assets
- Background sync for deferred API requests
- Offline-first data strategy with SWR/React Query

### 9.3 Low-Bandwidth Optimizations

- Dynamic image loading with next/image
- Code splitting with dynamic imports
- Static generation for content-heavy pages
- Incremental Static Regeneration for semi-dynamic content
- Responsive images with multiple sizes

## 10. Testing Strategy

### 10.1 Testing Levels

1. **Unit Tests** - Testing individual components and functions
2. **Integration Tests** - Testing interactions between components
3. **End-to-End Tests** - Testing complete user flows
4. **Accessibility Tests** - Testing for WCAG compliance
5. **Performance Tests** - Testing for performance benchmarks

### 10.2 Testing Tools

- Jest for unit and integration tests
- React Testing Library for component tests
- Playwright for end-to-end tests
- Axe for accessibility testing
- Lighthouse for performance testing

### 10.3 Testing Approach

- Test-driven development for core business logic
- Component-driven development for UI elements
- Continuous integration testing on Vercel's platform
- Synthetic monitoring for production performance

## 11. Deployment & DevOps

### 11.1 Vercel Deployment Setup

```
vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"], 
  "env": {
    "DATABASE_URL": "@database_url",
    "ANTHROPIC_API_KEY": "@anthropic_api_key",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### 11.2 Environment Configuration

- Development environment
- Staging environment
- Production environment
- Feature branch previews

### 11.3 CI/CD Pipeline

- Automatic deployments on merge to main
- Preview deployments for pull requests
- Automated testing before deployment
- Deployment approvals for production

## 12. Monitoring & Analytics

### 12.1 Application Monitoring

- Real-time error tracking with Sentry
- Performance monitoring with Vercel Analytics
- Custom event tracking for user flows
- Automated alerts for system issues

### 12.2 User Analytics

- Anonymous usage patterns
- Form completion rates
- Document upload success rates
- Appointment booking conversion
- AI assistance effectiveness

### 12.3 Business Metrics

- Cases processed per Justice Bus visit
- Document preparation rates
- User satisfaction scores
- Rural county coverage metrics
- Attorney time savings

## 13. Technical Implementation Phases

### 13.1 Phase 1: Foundation (Weeks 1-4)

- Project setup with Next.js on Vercel
- Core database schema implementation
- Authentication system implementation
- Basic user management
- Project infrastructure and CI/CD setup

### 13.2 Phase 2: Core Features (Weeks 5-8)

- Intake flow implementation
- Document management system
- Claude AI integration for basic assistance
- PWA configuration
- Basic appointment scheduling

### 13.3 Phase 3: Enhanced Features (Weeks 9-12)

- Offline mode implementation
- Advanced AI assistance features
- Justice Bus visit integration
- Notification system
- Administrator interface

### 13.4 Phase 4: Optimization & Testing (Weeks 13-16)

- Performance optimization
- Accessibility improvements
- Comprehensive testing
- Documentation
- Security audit

## 14. API Rate Limits & Scaling Considerations

### 14.1 Rate Limits

- Claude API: 10 requests per minute per user
- Document uploads: 20MB per file, 100MB total per case
- API endpoints: 100 requests per minute per IP

### 14.2 Scaling Strategy

- Vercel's serverless architecture for automatic scaling
- Edge functions for performance-critical operations
- Connection pooling for database connections
- Redis caching for frequently accessed data
- CDN caching for static assets

## 15. Technical Dependencies

### 15.1 Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@anthropic-ai/sdk": "^0.6.0",
    "@vercel/postgres": "^0.5.0",
    "@vercel/kv": "^0.2.0",
    "@vercel/blob": "^0.10.0",
    "next-auth": "^4.22.1",
    "react-hook-form": "^7.43.0",
    "zod": "^3.21.4",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^4.29.0",
    "swr": "^2.1.5",
    "date-fns": "^2.30.0",
    "axios": "^1.4.0",
    "resend": "^0.16.0",
    "twilio": "^4.11.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0",
    "eslint": "^8.38.0",
    "prettier": "^2.8.0",
    "typescript": "^5.0.0"
  }
}
```

### 15.2 External Services

- Anthropic API for Claude AI
- Twilio for SMS notifications
- Resend for email communication
- Sentry for error tracking
- Cal.com for appointment scheduling

## 16. Accessibility Implementation

### 16.1 Design Principles

- High contrast mode support
- Keyboard navigation support
- Screen reader optimization
- Focus management
- Reduced motion options

### 16.2 Technical Implementation

- ARIA attributes for interactive elements
- Semantic HTML structure
- Focus trapping for modals
- Skip links for keyboard navigation
- Form error announcements for screen readers

### 16.3 Testing Approach

- Automated accessibility testing with Axe
- Manual testing with screen readers
- Keyboard-only navigation testing
- Color contrast verification
- User testing with disabled users

## 17. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Intermittent rural connectivity | High | High | Robust offline capabilities, minimal network requirements |
| Legal information accuracy | High | Medium | Regular review by legal experts, clear disclaimers |
| AI response appropriateness | Medium | Medium | Careful prompt engineering, human oversight |
| Data security concerns | High | Low | End-to-end encryption, careful access control |
| Integration with Justice Bus scheduling | Medium | Medium | Fallback manual processes, incremental integration |
| User adoption challenges | High | Medium | Simplified UX, multiple access methods (web/phone) |
| Performance in low-end devices | Medium | High | Progressive enhancement, minimal client requirements |

## 18. Technical Support Plan

### 18.1 Support Levels

1. **Self-Service Support**
   - In-app help guides
   - FAQ documentation
   - Contextual tooltips

2. **Automated Support**
   - Claude AI-powered chatbot assistance
   - Guided troubleshooting flows
   - Automated error recovery

3. **Human Support**
   - Email support for technical issues
   - Phone support for urgent matters
   - In-person assistance at Justice Bus visits

### 18.2 Incident Response Plan

- Severity classification system
- Escalation pathways
- Response time commitments
- Incident documentation process

## 19. Technical Documentation

### 19.1 Developer Documentation

- API documentation with Swagger/OpenAPI
- Code documentation with JSDoc
- Architecture diagrams
- Development environment setup guide

### 19.2 User Documentation

- Administrator guide
- Justice Bus staff guide
- Technical support guide
- End-user help documentation

## 20. Conclusion & Signoff

This Technical Design Document outlines the comprehensive plan for implementing the Tennessee Justice Bus Pre-Visit Client Screening Application using Vercel's suite of products and integrations. The application is designed to enhance access to justice in rural Tennessee by improving the efficiency and effectiveness of the Justice Bus program.

Approvals:

- Technical Lead
- Product Manager
- Legal Subject Matter Expert
- Accessibility Expert
- Information Security Officer
