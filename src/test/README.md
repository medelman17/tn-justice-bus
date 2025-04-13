# Testing Guide for Tennessee Justice Bus App

This directory contains the test setup and utilities for testing the Tennessee Justice Bus application, with a particular focus on proper offline-first functionality testing.

## Testing Principles

In accordance with our development rules:

1. **Real data in production code**: All production code must handle real data and never rely on fallbacks
2. **Controlled test environments**: Tests use controlled data only in isolated test files
3. **No fallbacks**: Test for proper error handling rather than fallback mechanisms
4. **Clear test boundaries**: Test utilities are kept separate from implementation code

## Testing Setup

We use Vitest for testing, configured with specific environments for different types of tests:

- **Unit tests**: Use happy-dom for standard browser API testing
- **Service worker tests**: Use Miniflare to test service worker functionality
- **Integration tests**: Test real data flows and integrations

## Running Tests

Run tests using the following npm scripts:

```bash
# Run all tests once
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Open the interactive test UI
pnpm test:ui

# Generate test coverage report
pnpm test:coverage
```

## Testing Offline Functionality

When testing offline functionality:

1. **IndexedDB testing**: Tests use a real IndexedDB implementation provided by happy-dom
2. **Network simulation**: Use the `setNetworkStatus(online: boolean)` utility to simulate online/offline states
3. **Service worker testing**: Service worker tests use Miniflare for accurate emulation

## Example Test Structure

```typescript
// Import test utilities
import { describe, it, expect, beforeEach, vi } from "vitest";

// Import components/functions to test
import { someOfflineFunction } from "../path-to-module";

describe("Feature name", () => {
  // Set up test environment
  beforeEach(() => {
    // Clear database, reset network state, etc.
  });

  // Test cases
  it("should handle operation while online", async () => {
    // Test online behavior
    setNetworkStatus(true);
    // ...test code...
  });

  it("should handle operation while offline", async () => {
    // Test offline behavior
    setNetworkStatus(false);
    // ...test code...
  });
});
```

## Testing Best Practices

1. **Clean up after tests**: Always clean up any test data in afterEach blocks
2. **Isolated tests**: Each test should be independent and not rely on state from other tests
3. **Real data patterns**: Even test data should follow the same patterns as real data
4. **Error handling**: Test error cases explicitly to ensure proper handling
5. **Avoid mocks when possible**: Prefer real implementations to build confidence in the system

## Adding New Tests

1. Create new test files in `__tests__` directories near the code you're testing
2. Follow the naming convention: `feature-name.test.ts`
3. Import the necessary test utilities from Vitest
4. Structure tests with proper setup/teardown
