# Tennessee Justice Bus Documentation

## Technical Implementation Guides

This directory contains comprehensive documentation for the Tennessee Justice Bus application's technical implementations. The documentation is designed to help developers understand, maintain, and extend the application's features.

## Documentation Index

### [User Personas and Access Patterns](./user-personas-and-access-patterns.md)

A comprehensive guide defining the key user groups and their interaction patterns:

- Detailed personas for Rural Tennessee Residents, Volunteer Attorneys, Justice Bus Coordinators, and Community Partners
- Key access patterns for pre-visit preparation, appointment management, legal issue assessment, and more
- Implementation considerations for each user type and access pattern
- Current implementation status and next steps for each feature area
- Priority matrix for future development planning

This document serves as a foundational reference for understanding user needs and designing appropriate features.

### [Serwist Implementation Guide](./serwist-implementation-guide.md)

A comprehensive technical guide covering:

- Installation and setup of Serwist (Workbox fork)
- Service worker configuration
- Caching strategies for different content types
- Offline form handling and data synchronization
- JWT authentication for offline use
- Testing and debugging techniques
- Maintenance procedures

This document serves as the primary reference for the offline functionality implementation details.

### [PWA Concepts Guide](./pwa-concepts-guide.md)

A higher-level overview of:

- Progressive Web App fundamentals
- Core PWA components (Service Workers, Web App Manifest, HTTPS)
- Key PWA features implemented in the Justice Bus application
- Caching strategy patterns and use cases
- Best practices for PWA development
- Testing and performance considerations
- Browser compatibility considerations

This document is ideal for developers who need to understand the conceptual foundation of our PWA implementation.

### [Knock Implementation Guide](./knock-implementation-guide.md)

A detailed guide for SMS notifications using Knock:

- Overview of Knock notification infrastructure
- Installation and configuration steps
- Core concepts (workflows, recipients, channels)
- Workflow creation for verification codes, appointment reminders, and status updates
- Integration with authentication and appointment systems
- Offline-compatible notification queueing
- Testing and monitoring strategies
- Compliance and best practices

This document provides the technical reference for implementing and maintaining SMS communications in the Justice Bus application.

### [Mastra Implementation Guide](./mastra-implementation-guide.md)

A detailed implementation plan for client intake forms using the Mastra AI agent framework:

- Architecture and component design
- Database schema extensions for workflow management
- UI component structure and implementation
- Integration with Claude 3.7 Sonnet for conversational interfaces
- Graph-based workflow engine for structured conversations
- Persistent memory capabilities for offline support
- RAG implementation for Tennessee-specific legal knowledge
- Human-in-the-loop functionality for attorney review
- Testing strategies and success metrics

This document outlines the approach for enhancing client intake with AI agent capabilities while maintaining offline-first functionality.

### [Next.js 15 Routing Guide](./nextjs15-routing-guide.md)

A comprehensive guide covering Next.js 15 routing features and their application to the Justice Bus project:

- App Router core concepts and key routing patterns
- Promise-based page component props and migration strategies
- Advanced loading UI and error handling implementations
- Server-side routing features and middleware configurations
- Performance optimizations for rural connectivity
- Implementation steps for migrating from Next.js 14
- Testing and deployment considerations

This document provides the technical guidance for leveraging Next.js 15's routing capabilities to enhance the application's performance in rural areas with limited connectivity.

### [NextAuth.js v5 Migration Guide](./nextauth-v5-migration-guide.md)

A comprehensive guide for migrating from NextAuth.js v4 to v5 with edge compatibility:

- Key changes in NextAuth.js v5
- Edge-compatible implementation strategy
- Step-by-step migration instructions
- TypeScript updates and environment variable changes
- Testing strategies and troubleshooting tips
- Rollback plan for risk mitigation

This document provides a complete roadmap for upgrading our authentication system to support NextAuth.js v5 while ensuring edge compatibility.

### [SMS Verification Enhancement Guide](./sms-verification-enhancement-guide.md)

A detailed implementation plan for improving the SMS verification system:

- Current implementation analysis and enhancement goals
- Database schema for verification code storage
- API routes for code generation and verification
- Integration with Knock SMS notification service
- Enhanced UI components for the verification flow
- Offline support and security considerations
- Testing and rollback strategies

This document outlines a production-ready approach to SMS verification that improves security while maintaining our offline-first design principles.

### [Route Groups Implementation](./route-groups-implementation.md)

A detailed explanation of the Next.js 15 Route Groups implementation in the Tennessee Justice Bus application:

- Directory structure and organization
- Benefits of using route groups
- Implementation approach and notes
- Next steps for further Next.js 15 migration
- References to related documentation

This document provides information about our current route group implementation, which represents Phase 1 of our Next.js 15 routing features adoption.

## Implementation Overview

### Offline Functionality

The Tennessee Justice Bus application implements a robust offline-first approach to ensure that users in rural areas with limited connectivity can:

1. Access previously loaded content when offline
2. Complete intake forms without an internet connection
3. Maintain authentication during connectivity drops
4. Have their data synchronized automatically when connectivity returns

The implementation uses modern PWA techniques and the Serwist library (a maintained fork of Google's Workbox) to provide these capabilities.

### Communication System

To facilitate rural communications and notifications:

1. SMS notifications for verification codes, appointment reminders and status updates
2. Offline-compatible notification queueing
3. User preference management for communication types
4. Compliance with SMS regulations and best practices

The implementation uses Knock's notification infrastructure connected with Twilio as the primary SMS provider.

## Getting Started

If you're new to the project:

1. For offline functionality:

   - Start with the [PWA Concepts Guide](./pwa-concepts-guide.md) for a high-level understanding
   - Proceed to the [Serwist Implementation Guide](./serwist-implementation-guide.md) for technical details
   - Examine the source code in `/src/sw-custom.ts` and `/src/lib/offline-utils.ts`

2. For notification functionality:

   - Read the [Knock Implementation Guide](./knock-implementation-guide.md) for implementation details
   - Examine the source code in `/src/lib/knock.ts` and notification-related API routes

3. For client intake system:

   - Review the [Mastra Implementation Guide](./mastra-implementation-guide.md) for the AI-powered intake approach
   - Once implemented, examine the code in `/src/app/intake` and related components

4. For understanding user needs:
   - Start with the [User Personas and Access Patterns](./user-personas-and-access-patterns.md) document
   - Use this as a reference when designing new features or enhancing existing ones
   - Refer to the priority matrix when planning development work

## Contributing to Documentation

When making technical changes to the implementation, please ensure that the documentation is kept up-to-date. In particular:

- For PWA/offline changes:

  - Update caching strategies when modified
  - Document new offline capabilities
  - Keep the testing procedures current

- For notification/SMS changes:

  - Document workflow modifications
  - Update integration points when changed
  - Keep compliance information current

- For all documentation:
  - Update version numbers and timestamps
  - Ensure code examples reflect the actual implementation
  - Test procedures should be verified for accuracy
