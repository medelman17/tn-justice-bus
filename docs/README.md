# Tennessee Justice Bus Documentation

## Service Worker & PWA Implementation

This directory contains comprehensive documentation for the Tennessee Justice Bus application's offline functionality implementation. The documentation is designed to help developers understand, maintain, and extend the PWA features.

## Documentation Index

### [Serwist Implementation Guide](./serwist-implementation-guide.md)

A comprehensive technical guide covering:

- Installation and setup of Serwist (Workbox fork)
- Service worker configuration
- Caching strategies for different content types
- Offline form handling and data synchronization
- JWT authentication for offline use
- Testing and debugging techniques
- Maintenance procedures

This document serves as the primary reference for the technical implementation details.

### [PWA Concepts Guide](./pwa-concepts-guide.md)

A higher-level overview of:

- Progressive Web App fundamentals
- Core PWA components (Service Workers, Web App Manifest, HTTPS)
- Key PWA features implemented in the Justice Bus application
- Caching strategy patterns and use cases
- Best practices for PWA development
- Testing and performance considerations
- Browser compatibility considerations

This document is ideal for developers who need to understand the conceptual foundation of our implementation.

## Implementation Overview

The Tennessee Justice Bus application implements a robust offline-first approach to ensure that users in rural areas with limited connectivity can:

1. Access previously loaded content when offline
2. Complete intake forms without an internet connection
3. Maintain authentication during connectivity drops
4. Have their data synchronized automatically when connectivity returns

The implementation uses modern PWA techniques and the Serwist library (a maintained fork of Google's Workbox) to provide these capabilities.

## Getting Started

If you're new to the project or the PWA implementation:

1. Start with the [PWA Concepts Guide](./pwa-concepts-guide.md) for a high-level understanding
2. Proceed to the [Serwist Implementation Guide](./serwist-implementation-guide.md) for technical details
3. Examine the source code in `/src/sw-custom.ts` and `/src/lib/offline-utils.ts`

## Contributing to Documentation

When making changes to the PWA implementation, please ensure that the documentation is kept up-to-date. In particular:

- Update caching strategies when modified
- Document new offline capabilities
- Keep the testing procedures current
- Update version numbers and timestamps
