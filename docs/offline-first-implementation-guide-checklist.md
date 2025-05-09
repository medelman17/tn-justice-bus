# Tennessee Justice Bus Implementation Checklist

## Initial Setup

### Environment Setup

- [x] Install core dependencies
  ```bash
  pnpm add next-auth@beta @serwist/next
  # Note: @auth/supabase-adapter may be unnecessary if using JWT-only authentication
  pnpm add -D serwist vitest vitest-environment-miniflare @vitest/ui
  ```
- [x] Configure environment variables
  - [x] `AUTH_SECRET`
  - [x] `AUTH_URL` (equivalent present in Supabase configuration)
  - [x] `DATABASE_URL` (equivalent present as POSTGRES_URL)
  - [x] `EMAIL_SERVER` (equivalent present through RESEND_API_KEY)
  - [x] `EMAIL_FROM` (configured via Resend)

### Project Structure

- [x] Set up Next.js project structure
- [x] Configure TypeScript
- [x] Set up testing environment
- [x] Configure linting and formatting

## Offline-First Implementation

### Database Setup

- [x] Initialize IndexedDB schema (using mixed approach)
  - [x] Forms store (implemented in offline-utils.ts using localStorage)
  - [x] Events store (implemented in events-offline.ts using IndexedDB)
  - [x] Notifications store (implemented in offline-utils.ts)
  - [x] Auth store (implemented for tokens and verification)
  - [ ] Mastra workflows store
  - [ ] Legal knowledge store

### Service Worker

- [x] Configure Serwist in `next.config.ts`
- [x] Implement custom service worker
  - [x] Cache strategies for static assets
  - [x] API request handling
  - [x] Offline fallback pages
  - [x] Background sync registration

### Offline Storage Implementation

- [x] Implement unified storage strategy
  - [x] Create `offline-storage.ts` (implemented as offline-utils.ts)
  - [x] Set up database schema (mixed IndexedDB and localStorage)
  - [x] Implement CRUD operations
  - [ ] Add indexing for efficient queries

### Sync Management

- [x] Implement sync manager
  - [x] Form data synchronization
  - [x] Event data synchronization (implemented in events-offline.ts)
  - [x] Notification synchronization
  - [ ] Mastra workflow synchronization
  - [ ] Legal knowledge synchronization
- [x] Add retry logic and error handling
- [~] Implement conflict resolution (partially implemented for events)

## Mastra AI Integration

### Core Setup

- [ ] Install Mastra framework
  ```bash
  pnpm create mastra@latest --components agents,tools,workflows --llm anthropic
  ```
- [ ] Configure API keys and environment variables

### AI Components

- [x] Implement intake agent
  - [ ] Configure system prompts
  - [ ] Set up conversation workflows
  - [ ] Implement tool calling
- [ ] Set up vector database
  - [ ] Process legal documents
  - [ ] Generate embeddings
  - [ ] Implement search functionality

### Offline AI Support

- [ ] Implement offline Mastra support
  - [ ] Local workflow state persistence
  - [ ] Conversation history management
  - [ ] Local vector search implementation
- [ ] Add graceful degradation for offline mode

## Authentication Implementation

### NextAuth Setup

- [x] Configure edge-compatible auth
- [x] Set up authentication providers
- [x] Implement phone verification (with offline support)
- [ ] Add protected routes
- [x] Configure offline token persistence

### User Management

- [~] Implement user registration (partially implemented with issues, see docs/user-registration-issues.md)
- [ ] Set up profile management
- [ ] Add role-based access control
- [~] Configure session handling (basic implementation exists but needs improvement)

## UI Components

### Core Components

- [ ] Implement IntakeWizard
- [ ] Create IntakeStepNavigation
- [ ] Build ConversationalIntakeStep
- [ ] Develop StructuredFormStep
- [ ] Add DocumentRequestStep
- [ ] Create IntakeSummary

### Offline Indicators

- [ ] Add OfflineStatusIndicator
- [ ] Implement sync status display
- [ ] Add error state indicators
- [ ] Create loading states

## Testing

### Testing Guidelines

- [ ] Adhere to testing data principles
  - [ ] Use mocks ONLY in testing environment, never for development workarounds
  - [ ] All production code must handle real data and errors properly
  - [ ] Mock data must be clearly isolated in test files only
  - [ ] No fallback mechanisms in production code

### Unit Tests

- [ ] Set up Vitest with proper configuration
  ```bash
  pnpm add -D vitest vitest-environment-miniflare @vitest/ui
  ```
- [ ] Implement IndexedDB tests
  - [ ] Real database operations for integration tests
  - [ ] Controlled test-only mocks for unit tests
- [ ] Test sync manager
  - [ ] Real network requests for integration tests
  - [ ] Network mocks only for unit test isolation
- [ ] Test AI components with proper API integration
- [ ] Test authentication flows with auth provider testing utilities

### Integration Tests

- [ ] Configure Vitest for end-to-end testing
- [ ] Test form submissions with actual backend integration
- [ ] Test offline/online transitions with network condition simulation
- [ ] Test AI workflow persistence with real workflow data
- [ ] Test data synchronization with actual backend

### Offline Testing

- [ ] Create offline testing environment with Miniflare
- [ ] Test IndexedDB operations with proper isolation
- [ ] Verify data integrity during offline operations
- [ ] Test sync recovery with controlled network scenarios
- [ ] Test conflict resolution with real conflict patterns

### AI Testing

- [ ] Test Mastra workflows with controlled AI integration
- [ ] Test vector search with actual document corpus
- [ ] Test conversation persistence across sessions
- [ ] Validate AI responses against quality benchmarks

## Security & Performance

### Security Measures

- [ ] Implement secure data storage
- [ ] Add CSRF protection
- [ ] Configure rate limiting
- [ ] Set up proper error handling

### Performance Optimization

- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Configure caching strategies
- [ ] Add performance monitoring

## Documentation

### Technical Documentation

- [ ] Update implementation guide
- [ ] Document API endpoints
- [ ] Add setup instructions
- [ ] Include troubleshooting guide

### User Documentation

- [ ] Create user manual
- [ ] Add FAQ section
- [ ] Document offline capabilities
- [ ] Include AI interaction guidelines

## Deployment

### Pre-deployment

- [ ] Run security audit
- [ ] Perform performance testing
- [ ] Check accessibility compliance
- [ ] Validate offline functionality

### Deployment Steps

- [ ] Configure production environment
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Enable analytics

## Maintenance

### Regular Tasks

- [ ] Monitor error logs
- [ ] Update dependencies
- [ ] Review AI performance
- [ ] Check sync efficiency

### Backup & Recovery

- [ ] Set up data backup
- [ ] Document recovery procedures
- [ ] Test restore processes
- [ ] Verify offline data integrity
