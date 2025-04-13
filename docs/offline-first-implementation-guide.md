# Tennessee Justice Bus Implementation Guide

## Table of Contents

1. [Offline-First Approach](#offline-first-approach)
2. [Authentication Implementation](#authentication-implementation)
3. [Service Worker & Offline Support](#service-worker--offline-support)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)

## Offline-First Approach

### Current Implementation Overview

We currently have several offline-related implementations:

1. **Events System** (`src/lib/events-offline.ts`)

   - Uses IndexedDB for storing events data
   - Implements background sync for data synchronization
   - Handles offline/online transitions

2. **Form Submissions** (`src/lib/offline-utils.ts`)

   - Currently uses localStorage for the form queue
   - Basic offline form submission handling
   - Simple sync when coming back online

3. **Notifications** (`src/lib/knock.ts`)

   - Basic localStorage-based queue
   - Limited offline support
   - No robust error handling or retry logic

4. **Mastra AI Components** (`src/mastra/*`)
   - AI agent workflow states stored locally
   - Conversation history persistence
   - Local vector storage for essential legal knowledge

### Migration Path to Offline-First

#### 1. Unified Storage Strategy

```typescript
// lib/offline-storage.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface JusticeBusDB extends DBSchema {
  forms: {
    key: string;
    value: {
      id: string;
      type: "intake" | "followup" | "documentation";
      data: any;
      status: "draft" | "pending-sync" | "synced";
      lastModified: number;
    };
    indexes: { "by-status": string };
  };
  events: {
    key: string;
    value: {
      id: string;
      data: any;
      lastModified: number;
    };
  };
  notifications: {
    key: string;
    value: {
      id: string;
      workflowKey: string;
      payload: any;
      status: "pending" | "failed" | "sent";
      attempts: number;
      lastAttempt: number;
    };
    indexes: { "by-status": string };
  };
  auth: {
    key: string;
    value: {
      token: string;
      expiresAt: number;
    };
  };
  mastraWorkflows: {
    key: string;
    value: {
      id: string;
      workflowType: string;
      currentStep: string;
      agentMemory: any;
      status: "in_progress" | "pending_sync" | "completed";
      lastInteractionAt: number;
    };
    indexes: { "by-status": string };
  };
  legalKnowledge: {
    key: string;
    value: {
      id: string;
      category: string;
      content: string;
      vectorEmbedding: Float32Array;
      lastUpdated: number;
    };
    indexes: { "by-category": string };
  };
}

let db: IDBPDatabase<JusticeBusDB>;

export async function initializeDB() {
  db = await openDB<JusticeBusDB>("justice-bus-db", 1, {
    upgrade(db) {
      // Forms store
      const formStore = db.createObjectStore("forms", { keyPath: "id" });
      formStore.createIndex("by-status", "status");

      // Events store
      db.createObjectStore("events", { keyPath: "id" });

      // Notifications store
      const notifStore = db.createObjectStore("notifications", {
        keyPath: "id",
        autoIncrement: true,
      });
      notifStore.createIndex("by-status", "status");

      // Auth store
      db.createObjectStore("auth", { keyPath: "id" });

      // Mastra workflow store
      const workflowStore = db.createObjectStore("mastraWorkflows", {
        keyPath: "id",
      });
      workflowStore.createIndex("by-status", "status");

      // Legal knowledge store for offline vector search
      const knowledgeStore = db.createObjectStore("legalKnowledge", {
        keyPath: "id",
      });
      knowledgeStore.createIndex("by-category", "category");
    },
  });
}
```

#### 2. Mastra Offline Support

```typescript
// lib/mastra-offline.ts
import { db } from "./offline-storage";
import { Container } from "@mastra/core";
import { cosineSimilarity } from "@/lib/vector-utils";

export class OfflineMastraSupport {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.initialize();
  }

  private async initialize() {
    // Load offline user context
    const authData = await db.get("auth", "current");
    if (authData) {
      this.container.set("userId", authData.userId);
      this.container.set("userContext", authData.context);
    }
  }

  async searchLegalKnowledge(
    query: string,
    embedding: Float32Array
  ): Promise<any[]> {
    const tx = db.transaction("legalKnowledge", "readonly");
    const store = tx.objectStore("legalKnowledge");
    const results = [];

    // Perform vector similarity search locally
    let cursor = await store.openCursor();
    while (cursor) {
      const similarity = cosineSimilarity(
        embedding,
        cursor.value.vectorEmbedding
      );
      if (similarity > 0.7) {
        // Configurable threshold
        results.push({
          ...cursor.value,
          similarity,
        });
      }
      cursor = await cursor.continue();
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  async saveWorkflowState(workflowId: string, state: any) {
    await db.put("mastraWorkflows", {
      id: workflowId,
      ...state,
      lastInteractionAt: Date.now(),
    });
  }

  async resumeWorkflow(workflowId: string) {
    const state = await db.get("mastraWorkflows", workflowId);
    if (!state) return null;

    // Rehydrate workflow state
    return {
      ...state,
      container: this.container,
    };
  }
}
```

#### 3. Enhanced Sync Manager

```typescript
// lib/sync-manager.ts
import { db } from "./offline-storage";

class SyncManager {
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 5000;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    window.addEventListener("online", () => this.startSync());
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.startSync();
      }
    }, 60000);
  }

  private async startSync() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      await Promise.all([
        this.syncForms(),
        this.syncNotifications(),
        this.syncEvents(),
        this.syncMastraWorkflows(),
        this.syncLegalKnowledge(),
      ]);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncMastraWorkflows() {
    const tx = db.transaction("mastraWorkflows", "readwrite");
    const index = tx.store.index("by-status");
    let cursor = await index.openCursor("pending_sync");

    while (cursor) {
      const workflow = cursor.value;
      try {
        const response = await fetch("/api/mastra/workflows/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workflow),
        });

        if (!response.ok) throw new Error("Sync failed");

        await cursor.update({
          ...workflow,
          status: "completed",
        });
      } catch (error) {
        if (workflow.attempts >= this.maxRetries) {
          await cursor.update({
            ...workflow,
            status: "failed",
          });
        } else {
          await cursor.update({
            ...workflow,
            attempts: (workflow.attempts || 0) + 1,
            lastAttempt: Date.now(),
          });
        }
      }
      cursor = await cursor.continue();
    }
  }

  // ... existing sync methods for forms, notifications, and events
}

export const syncManager = new SyncManager();
```

### Migration Steps

1. **Database Migration**

   - Create new IndexedDB stores using `offline-storage.ts`
   - Migrate existing localStorage data to IndexedDB
   - Add Mastra-specific stores for workflows and legal knowledge
   - Validate data integrity after migration

2. **Component Updates**

   - Update all form components to use new form handler
   - Add offline indicators and status messages
   - Implement optimistic UI updates
   - Integrate Mastra offline support for AI components

3. **Service Worker Updates**

   - Update cache strategies for offline-first approach
   - Implement background sync registration
   - Add offline fallbacks for critical routes
   - Cache essential legal knowledge for offline AI operations

4. **Testing**

   ```bash
   # Install testing dependencies
   pnpm add -D jest-localstorage-mock fake-indexeddb

   # Run migration tests
   pnpm test:offline-migration

   # Test offline functionality
   pnpm test:offline

   # Test Mastra offline capabilities
   pnpm test:mastra-offline
   ```

### Validation Checklist

- [ ] All forms work offline
- [ ] Data syncs when connection returns
- [ ] Conflict resolution works correctly
- [ ] Offline indicators are clear and accurate
- [ ] Service worker caches appropriate resources
- [ ] Background sync registered for critical operations
- [ ] Error handling and retry logic implemented
- [ ] Migration script handles all edge cases
- [ ] Mastra workflows persist offline
- [ ] Legal knowledge available offline
- [ ] AI features gracefully degrade offline
- [ ] Vector search works in offline mode

## Authentication Implementation

### Overview

The Tennessee Justice Bus application uses NextAuth.js v5 (AuthJS) with a split configuration approach for edge compatibility. This setup supports both phone and email-based authentication with verification codes.

### Key Files

- `auth.config.ts`: Edge-compatible auth configuration
- `auth.ts`: Full auth configuration with database integration
- `middleware.ts`: Route protection and auth checks
- `src/types/next-auth.d.ts`: TypeScript definitions for auth

### Setting Up Authentication

1. **Install Dependencies**

```bash
pnpm add next-auth@beta
pnpm add @auth/supabase-adapter
```

2. **Configure Environment Variables**

```env
# Auth Configuration
AUTH_SECRET=your-auth-secret-key
AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://username:password@host:port/database-name

# Email Provider
EMAIL_SERVER=smtp://username:password@host:port
EMAIL_FROM=noreply@tnjusticebus.org
```

3. **Edge-Compatible Configuration (auth.config.ts)**

```typescript
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "phone-login",
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.code) return null;
        // Basic validation for edge compatibility
        const isValidCode =
          credentials.code.length === 6 && /^\d+$/.test(credentials.code);
        if (!isValidCode) return null;
        return {
          id: "edge-auth-placeholder",
          phone: credentials.phone,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublicPage = publicPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );
      return isOnPublicPage || isLoggedIn;
    },
  },
};
```

4. **Full Auth Configuration (auth.ts)**

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, verificationCodes } from "@/db/schema";

export const { auth, handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
});
```

5. **API Route Handler (app/api/auth/[...nextauth]/route.ts)**

```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

## Service Worker & Offline Support

### Overview

The application uses Serwist (a modern fork of Workbox) for service worker implementation, providing offline support and caching strategies.

### Key Files

- `next.config.ts`: Serwist configuration
- `src/sw-custom.ts`: Custom service worker implementation
- `src/lib/offline-utils.ts`: Offline utility functions

### Setting Up Service Worker

1. **Install Dependencies**

```bash
pnpm add @serwist/next
pnpm add -D serwist
```

2. **Configure Next.js (next.config.ts)**

```typescript
import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "src/sw-custom.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // ... your other config
};

export default withPWA(nextConfig);
```

3. **Implement Service Worker (sw-custom.ts)**

```typescript
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";

const CACHE_NAME = "justice-bus-cache-v1";
const AUTH_PATHS = ["/api/auth", "/auth/signin", "/auth/signout"];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip auth-related requests
  if (AUTH_PATHS.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request.clone(), {
        credentials: "same-origin",
      })
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache static assets
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif)$/)) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
    );
    return;
  }
});
```

### Offline Support Implementation

1. **Create Offline Page**

```typescript
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
      </div>
    </div>
  );
}
```

2. **Implement Offline Utils**

```typescript
// lib/offline-utils.ts
export async function getAuthToken(): Promise<string | null> {
  const token = localStorage.getItem("auth_token");
  if (token) return token;

  if ("caches" in window) {
    try {
      const cache = await caches.open("auth-tokens");
      const response = await cache.match("/auth-token");
      if (response) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Error retrieving token from cache:", error);
    }
  }
  return null;
}
```

## Environment Configuration

### Development Environment

```env
NODE_ENV=development
AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://localhost:5432/justice_bus
```

### Production Environment

```env
NODE_ENV=production
AUTH_URL=https://your-production-domain.com
DATABASE_URL=your-production-db-url
AUTH_SECRET=your-production-secret
```

## Troubleshooting

### Common Issues and Solutions

1. **Service Worker Conflicts with Auth**

   - Ensure auth endpoints are excluded from service worker caching
   - Clear service worker registration and browser cache
   - Check credential handling in fetch events

2. **Authentication Issues**

   - Verify environment variables are correctly set
   - Check cookie settings in auth configuration
   - Ensure database connection is working

3. **Offline Functionality**
   - Test with Chrome DevTools' offline mode
   - Check service worker registration in Application tab
   - Verify cache storage contents

### Debugging Tools

1. **Chrome DevTools**

   - Application > Service Workers: Check SW status
   - Application > Cache Storage: Inspect cached resources
   - Network: Test offline functionality

2. **NextAuth Debug Mode**

   ```typescript
   export const authConfig = {
     debug: process.env.NODE_ENV === "development",
     // ... other config
   };
   ```

3. **Service Worker Logs**
   ```typescript
   // Add to sw-custom.ts
   self.addEventListener("install", (event) => {
     console.log("Service Worker installing.");
     // ... rest of install handler
   });
   ```

### Best Practices

1. **Authentication**

   - Use secure cookies in production
   - Implement proper CSRF protection
   - Regular token rotation
   - Rate limiting for verification attempts

2. **Service Worker**

   - Version your cache names
   - Implement proper cache cleanup
   - Handle offline form submissions
   - Test thoroughly in various network conditions

3. **Development Workflow**

   - Disable service worker in development
   - Use proper TypeScript types
   - Implement proper error handling
   - Regular security audits

4. **Offline-First Development**

   - Always develop and test in offline mode first
   - Implement proper loading states and feedback
   - Use optimistic UI updates
   - Handle sync conflicts gracefully

5. **Data Management**

   - Implement proper data versioning
   - Use appropriate storage methods (IndexedDB, LocalStorage)
   - Regular cleanup of old cached data
   - Clear sync status indicators

6. **Testing**
   - Test in various network conditions
   - Verify sync functionality
   - Check conflict resolution
   - Validate offline data integrity
