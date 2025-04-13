# Serwist Implementation Guide for Tennessee Justice Bus PWA

## Overview

This guide documents the implementation of offline functionality in the Tennessee Justice Bus application using Serwist (a modern fork of Workbox). This implementation is critical for the application's ability to function in rural areas with limited connectivity.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation and Setup](#installation-and-setup)
3. [Service Worker Configuration](#service-worker-configuration)
4. [Caching Strategies](#caching-strategies)
5. [Offline Page Implementation](#offline-page-implementation)
6. [Offline Form Handling](#offline-form-handling)
7. [JWT Authentication for Offline Use](#jwt-authentication-for-offline-use)
8. [Background Sync Implementation](#background-sync-implementation)
9. [Testing and Debugging](#testing-and-debugging)
10. [Maintenance and Updates](#maintenance-and-updates)

## Introduction

The Tennessee Justice Bus application serves rural communities where internet connectivity is often limited or unreliable. Our offline-first approach ensures that users can:

- Access previously loaded content when offline
- Complete and submit forms without an internet connection
- Maintain their authentication state during connectivity drops
- Have their data automatically synchronized when connectivity returns

This is accomplished using:

- **Serwist**: A fork of Google's Workbox library for service worker management
- **Progressive Web App (PWA)** technologies: For native-like offline functionality
- **Custom utility functions**: For managing offline data and authentication

## Installation and Setup

### Dependencies

```bash
# Install Serwist and related dependencies
pnpm add @serwist/next
pnpm add -D serwist
```

### Next.js Configuration

Update `next.config.ts` to integrate with Serwist:

```typescript
import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "src/sw-custom.ts", // Path to your service worker file
  swDest: "public/sw.js", // Output path for the service worker
  // Disable during development to avoid registration issues
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure TypeScript errors don't prevent builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
```

### TypeScript Configuration

Update `tsconfig.json` to support service worker types:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    // other config...
    "types": ["@serwist/next/typings"]
  }
}
```

### Web App Manifest

Create `public/manifest.json` for PWA support:

```json
{
  "name": "Tennessee Justice Bus Pre-Visit Screening",
  "short_name": "Justice Bus",
  "description": "Pre-visit screening and preparation for Tennessee Justice Bus clients",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f766e",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Git Configuration

Update `.gitignore` to exclude service worker generated files:

```
# Serwist
public/sw.js
public/sw.js.map
public/worker-*.js
public/worker-*.js.map
public/workbox-*.js
public/workbox-*.js.map
```

## Service Worker Configuration

Our service worker implementation (`src/sw-custom.ts`) uses a custom approach tailored specifically for the Tennessee Justice Bus application:

```typescript
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";

// Define the service worker global scope type
declare const self: ServiceWorkerGlobalScope;

// Custom cache name
const CACHE_NAME = "justice-bus-cache-v1";

// Pages to precache
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/dashboard",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
  "/manifest.json",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Cache cleanup on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Add fetch event listeners (abbreviated - see full implementation in sw-custom.ts)
self.addEventListener("fetch", (event) => {
  // Implementation details covered in Caching Strategies section
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  // Handle special messages like storing auth tokens
});
```

## Caching Strategies

Our service worker implements different caching strategies for different types of content:

### 1. Navigation Requests (HTML Pages)

Network-first with offline fallback for navigation requests:

```typescript
// Special handling for navigation requests (HTML pages)
if (event.request.mode === "navigate") {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match("/offline").then((response) => {
        // Fallback to offline page
        return (
          response ||
          new Response("Offline page not found", {
            status: 404,
            headers: { "Content-Type": "text/html" },
          })
        );
      });
    })
  );
  return;
}
```

### 2. API Requests

Network-first with cached fallback for API routes:

```typescript
// For API requests, try network first with timeout fallback to cache
if (event.request.url.includes("/api/")) {
  event.respondWith(
    fetch(event.request.clone())
      .then((response) => {
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cached response or error message
        return caches.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response(
              JSON.stringify({
                error: "Network error. Using cached response if available.",
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        });
      })
  );
  return;
}
```

### 3. POST Requests (Form Submissions)

Custom offline handling for form submissions:

```typescript
// Handle POST requests for form submissions
if (event.request.method === "POST") {
  event.respondWith(
    fetch(event.request.clone()).catch(() => {
      // If offline, return a custom response based on URL
      if (event.request.url.includes("/api/intake/")) {
        return new Response(
          JSON.stringify({
            status: "offline",
            message:
              "Your form has been saved and will be submitted when you're back online.",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Similar patterns for other POST endpoints
    })
  );
  return;
}
```

### 4. Static Assets

Cache-first strategy for static assets:

```typescript
// Default strategy - Cache First for static assets
if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp)$/)) {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache, get from network
      return fetch(event.request.clone()).then((response) => {
        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
  return;
}
```

### 5. All Other Requests

Network-first with cache fallback:

```typescript
// Network-first strategy for everything else
event.respondWith(
  fetch(event.request).catch(() => {
    return caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        new Response("Resource not available offline", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        })
      );
    });
  })
);
```

## Offline Page Implementation

We've created a custom offline page (`src/app/offline/page.tsx`) that provides useful information to users when they're offline:

```tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold text-primary">
        You&apos;re offline
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        The Tennessee Justice Bus app requires an internet connection for some
        features. However, you can still access previously loaded information
        and forms.
      </p>

      <div className="mb-8 rounded-lg bg-amber-50 p-4 text-left text-amber-800">
        <h2 className="mb-2 font-semibold">What you can do while offline:</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>View previously loaded cases and information</li>
          <li>
            Fill out intake forms (they&apos;ll submit when you&apos;re back
            online)
          </li>
          <li>Prepare documents for your appointment</li>
          <li>Review legal issue information</li>
        </ul>
      </div>

      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
```

## Offline Form Handling

We've implemented utilities for handling form submissions when offline:

### 1. Form Submission Utility (`src/lib/offline-utils.ts`)

```typescript
/**
 * Submit form with offline support
 * @param url API endpoint to submit to
 * @param data Form data
 * @returns Promise with API response or offline status
 */
export async function submitFormWithOfflineSupport<T>(
  url: string,
  data: FormData
): Promise<T | { status: "offline"; message: string }> {
  // Check if we're online
  if (navigator.onLine) {
    try {
      // If online, submit directly
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  } else {
    // If offline, store in local storage
    await storeFormDataLocally(url, data);

    // Return a response that indicates offline submission
    return {
      status: "offline",
      message:
        "Your form has been saved and will be submitted when you're back online.",
    };
  }
}
```

### 2. Local Storage Queue

```typescript
/**
 * Store form data locally
 * @param url API endpoint
 * @param data Form data
 */
async function storeFormDataLocally(
  url: string,
  data: FormData
): Promise<void> {
  try {
    // Get existing queue or create new one
    const queueString = localStorage.getItem("offline_form_queue") || "[]";
    const queue = JSON.parse(queueString);

    // Add new item to queue
    queue.push({
      url,
      data,
      timestamp: new Date().toISOString(),
    });

    // Store updated queue
    localStorage.setItem("offline_form_queue", JSON.stringify(queue));

    console.log("Form data stored locally for offline use");
  } catch (error) {
    console.error("Error storing form data locally:", error);
  }
}
```

### 3. Background Synchronization

```typescript
/**
 * Process offline form queue when coming back online
 */
export function setupOfflineSync(): void {
  window.addEventListener("online", async () => {
    console.log("Back online, checking for pending form submissions...");

    try {
      const queueString = localStorage.getItem("offline_form_queue") || "[]";
      const queue = JSON.parse(queueString);

      if (queue.length === 0) {
        console.log("No pending submissions found");
        return;
      }

      console.log(`Found ${queue.length} pending submissions to process`);

      // Process queue
      const newQueue = [];
      for (const item of queue) {
        try {
          // Attempt to submit
          await fetch(item.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item.data),
          });

          console.log(`Successfully submitted form to ${item.url}`);
        } catch (error) {
          console.error(`Failed to submit form to ${item.url}:`, error);
          // Keep failed submissions in the queue for next attempt
          newQueue.push(item);
        }
      }

      // Update queue with only failed submissions
      localStorage.setItem("offline_form_queue", JSON.stringify(newQueue));

      if (newQueue.length === 0) {
        console.log("All pending submissions processed successfully");
      } else {
        console.log(
          `${newQueue.length} submissions failed and will be retried later`
        );
      }
    } catch (error) {
      console.error("Error processing offline form queue:", error);
    }
  });
}
```

## JWT Authentication for Offline Use

Our application maintains authentication state even when offline using a combination of:

### 1. Token Storage

```typescript
/**
 * Store authentication token for offline access
 * @param token JWT token to store
 */
export function storeAuthToken(token: string) {
  // Store in localStorage (for immediate use)
  localStorage.setItem("auth_token", token);

  // Also store in service worker cache (for offline access)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "STORE_AUTH_TOKEN",
      token,
    });
  }
}
```

### 2. Service Worker Handling

```typescript
// Listen for messages from the client
self.addEventListener("message", (event) => {
  // Store auth token in cache
  if (event.data && event.data.type === "STORE_AUTH_TOKEN") {
    caches.open("auth-tokens").then((cache) => {
      cache.put("/auth-token", new Response(JSON.stringify(event.data.token)));
    });
  }
});
```

### 3. Token Retrieval

```typescript
/**
 * Retrieve auth token (works offline)
 * @returns Promise resolving to token string or null
 */
export async function getAuthToken(): Promise<string | null> {
  // Try localStorage first
  const token = localStorage.getItem("auth_token");
  if (token) return token;

  // If not in localStorage, try the service worker cache
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

## Background Sync Implementation

In addition to our custom sync logic, the service worker handles:

1. **Form Submissions**: When forms are submitted offline, the service worker returns a custom response, and our client-side code queues the submission for when connectivity returns.

2. **Automatic Retries**: When the device comes back online, pending submissions are automatically processed.

3. **Failure Handling**: Items that fail to submit remain in the queue for future retry attempts.

This ensures that users can continue their work even with intermittent connectivity.

## Testing and Debugging

### Manual Testing Procedures

1. **Enable Offline Mode**:

   - Use Chrome DevTools Network tab "Offline" option
   - Test various user flows when offline

2. **Service Worker Debugging**:

   - Use Chrome DevTools Application tab > Service Workers
   - Enable "Update on reload" during development
   - Check "Offline" to simulate offline conditions

3. **Key Test Scenarios**:
   - Load app, go offline, try navigating to different pages
   - Fill out forms offline and test sync when going back online
   - Test offline authentication persistence
   - Verify cached assets load properly offline

### Common Issues and Solutions

1. **Service Worker Not Registering**:

   - Ensure HTTPS or localhost is being used
   - Check for errors in browser console
   - Verify `next.config.ts` has proper Serwist configuration

2. **Caching Issues**:

   - Clear browser cache during testing
   - Check cache storage in DevTools Application tab
   - Verify cache names match between service worker and client code

3. **Updates Not Applying**:
   - Use version numbers in cache names
   - Implement `skipWaiting` and `clientsClaim` for immediate activation
   - Check activation process in DevTools

## Maintenance and Updates

### Updating the Service Worker

When updating the service worker logic:

1. Increment the cache version number (`CACHE_NAME = "justice-bus-cache-v2"`)
2. The service worker's `activate` event will clear old caches
3. Test thoroughly in a staging environment before deploying

### Monitoring and Analytics

Consider implementing:

1. **Performance Monitoring**:

   - Track service worker installation success rate
   - Monitor cache hits/misses
   - Track offline usage patterns

2. **Error Logging**:
   - Log service worker errors
   - Monitor sync failures
   - Track offline submission queue length

### Best Practices

1. **Keep Dependencies Updated**:

   - Regularly update Serwist and related packages
   - Check for security updates

2. **Documentation**:

   - Update this guide when significant changes are made
   - Document cache strategy changes
   - Keep code comments clear and current

3. **Testing**:
   - Maintain a regression test suite for offline functionality
   - Test on various devices and network conditions

---

This guide is maintained by the Tennessee Justice Bus development team. Last updated: April 12, 2025.
