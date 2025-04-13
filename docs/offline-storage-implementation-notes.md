# Offline Storage Implementation Notes

## Current Approach: localStorage

The Tennessee Justice Bus application currently implements offline storage capabilities using the browser's `localStorage` API rather than the originally planned IndexedDB approach. This was chosen as a pragmatic solution to get the offline functionality working while keeping the implementation simpler.

### Implementation Details

The offline storage is implemented in:

- `src/lib/offline-utils.ts` - Core offline storage and sync utilities
- `src/lib/offline-verification.ts` - Specific offline support for authentication

Key features of the current implementation:

1. **Form Data Storage**

   - Form submissions during offline mode are stored in localStorage
   - When back online, these are automatically processed and submitted
   - Retry logic is implemented for failed submissions

2. **Notification Queue**

   - Notifications that cannot be sent offline are queued
   - Automatically processed when the user returns online

3. **Authentication**

   - Auth tokens are stored both in localStorage and service worker cache
   - Verification attempts made while offline are stored and processed when online
   - Token retrieval works even in offline mode

4. **Sync Management**
   - The `setupOfflineSync()` function runs on online events
   - It processes all queued form submissions and notifications
   - Failed submissions are kept in the queue for future retry attempts

### Limitations of localStorage

The current localStorage implementation has some limitations:

1. **Storage Capacity**: Limited to ~5MB per domain
2. **No Indexing**: Cannot perform efficient queries on stored data
3. **String-Only Storage**: All data must be serialized to strings (using JSON.stringify)
4. **No Transaction Support**: Cannot group operations in atomic transactions
5. **Synchronous API**: Can block the main thread with large operations

## Future Plan: IndexedDB Implementation

As outlined in the original implementation guide, the project should eventually migrate to IndexedDB for more robust offline storage. IndexedDB would provide:

1. **More Storage Space**: Much larger storage limits
2. **Complex Data Types**: Native support for JavaScript objects
3. **Indexing**: Efficient querying of stored data
4. **Transaction Support**: Atomicity for operations
5. **Asynchronous API**: Non-blocking operations

### Planned IndexedDB Schema

When implementing IndexedDB, the following stores should be created:

1. **Forms Store**: Client-side storage for form data and submissions
2. **Events Store**: User interaction events and app state changes
3. **Notifications Store**: Notifications queue with delivery status
4. **Auth Store**: Authentication tokens and session information
5. **Mastra Workflows Store**: Offline AI workflow state
6. **Legal Knowledge Store**: Cached legal information and references

### Migration Strategy

When transitioning from localStorage to IndexedDB:

1. **Parallel Implementation**: Build IndexedDB alongside localStorage
2. **Data Migration**: Move existing localStorage data to IndexedDB
3. **Feature Parity**: Ensure all current offline features work with the new implementation
4. **Performance Testing**: Validate performance improvements

## Implementation Priorities

1. **Storage Interface Abstraction**: Create a common interface that can work with either storage backend
2. **IndexedDB Schema Design**: Detailed design of the database schema
3. **Sync Improvements**: Add conflict resolution for complex data synchronization
4. **Migration Utilities**: Tools to help with the localStorage to IndexedDB transition
