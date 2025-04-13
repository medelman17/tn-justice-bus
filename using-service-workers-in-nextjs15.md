# Implementing Service Workers for Offline Support in Next.js 15

This guide walks through the process of implementing service workers in a Next.js 15 application to enable offline functionality.

## Table of Contents

1. [Understanding Service Workers](#understanding-service-workers)
2. [Implementation Options](#implementation-options)
3. [Basic Implementation](#basic-implementation)
4. [Advanced Configuration](#advanced-configuration)
5. [Testing Your Service Worker](#testing-your-service-worker)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Understanding Service Workers

Service workers are JavaScript files that run separately from the main browser thread, acting as proxies between web applications and the network. They enable:

- **Offline functionality** by caching assets and API responses
- **Background processing** for tasks like push notifications
- **Network request interception** to modify or serve cached responses

Service workers follow a lifecycle of registration, installation, activation, and fetch handling.

## Implementation Options

### Option 1: Manual Implementation (Public Directory)

Since Next.js 9.1, you can place service worker files in the `public` directory where they're automatically served from the root path.

### Option 2: Using Serwist (Recommended)

Serwist is a well-maintained fork of Workbox that integrates with Next.js. It's currently the most reliable option for implementing PWA features.

### Option 3: Custom Configuration with Workbox

For more advanced use cases, you can directly use Workbox to configure service workers with fine-grained control over caching strategies.

## Basic Implementation

Let's implement a basic service worker using the Serwist approach:

### Step 1: Install Required Packages

```bash
npm install @serwist/next
npm install -D serwist
```

### Step 2: Configure Next.js

Create or modify your `next.config.js` file:

```javascript
const withSerwist = require("@serwist/next").default({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  register: true,
  skipWaiting: true,
});

module.exports = withSerwist({
  // Your existing Next.js config
});
```

### Step 3: Create Service Worker File

Create `src/sw.js` with basic offline caching:

```javascript
import { defaultCache } from "@serwist/next/worker";
import { clientsClaim } from "@serwist/sw";
import { installSerwist } from "@serwist/sw/install";

// This approach gives you control over the caching strategies
self.skipWaiting();
clientsClaim();

// Create a reusable precache manifest
installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // Define runtime caching rules
  runtimeCaching: [
    // Cache page navigations (HTML) with a Network First strategy
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache images with a Cache First strategy
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "imageCache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Cache static assets (JS, CSS) with StaleWhileRevalidate
    {
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "staticCache",
      },
    },
    // Cache API responses
    {
      urlPattern: /\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "apiCache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});
```

### Step 4: Create a Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "My Next.js App",
  "short_name": "Next App",
  "description": "A Next.js application with offline support",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 5: Add Manifest to Document Head

Update `pages/_document.js` or `app/layout.js`:

```javascript
// For Pages Router (_document.js)
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// For App Router (layout.js)
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    title: 'My Next.js App',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 6: Create an Offline Fallback Page

Create `src/app/offline/page.js`:

```javascript
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">You are offline</h1>
      <p>Please check your internet connection and try again.</p>
    </div>
  );
}
```

## Advanced Configuration

### Custom Cache Strategies

For more control over caching, define custom strategies in your service worker:

```javascript
// Add to your sw.js file
// Cache then network with offline fallback for API data
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/data"),
  new NetworkFirst({
    cacheName: "api-data",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      {
        // Custom plugin for offline fallback data
        handlerDidError: async () => {
          return caches.match("/api/fallback-data");
        },
      },
    ],
  })
);
```

### Background Sync

For handling form submissions when offline:

```javascript
// Add to your sw.js file
import { BackgroundSyncPlugin } from "@serwist/background-sync";

const bgSyncPlugin = new BackgroundSyncPlugin("formQueue", {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
});

// Register a route for form submissions that will use background sync
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/submit-form"),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  "POST"
);
```

### Periodic Background Sync

For fetching new content periodically:

```javascript
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-update") {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  const cache = await caches.open("content-cache");
  await cache.add("/api/latest-content");
  // Notify the user if the app is open
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "CONTENT_UPDATED",
        timestamp: new Date().toISOString(),
      });
    });
  });
}

// Register for periodic sync from your app
if ("periodicSync" in navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(async (registration) => {
    try {
      await registration.periodicSync.register("content-update", {
        minInterval: 24 * 60 * 60 * 1000, // 1 day
      });
    } catch (error) {
      console.log("Periodic Sync could not be registered:", error);
    }
  });
}
```

## Testing Your Service Worker

### Development Environment

1. Set up your Next.js app to serve the service worker in development:

```javascript
// next.config.js
const withSerwist = require("@serwist/next").default({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  // Enable in development for testing
  disable: false,
});
```

2. Use Chrome DevTools:
   - Open Application > Service Workers
   - Enable "Update on reload"
   - Test offline functionality with "Offline" checkbox

### Production Testing

1. Build and start your app:

```bash
npm run build
npm run start
```

2. Verify the service worker registration:

   - Check browser console for successful registration
   - Confirm service worker status in Application > Service Workers

3. Test offline functionality:
   - Navigate through your app to cache pages
   - Disconnect from the internet or use DevTools offline mode
   - Verify that cached pages and assets are available

## Troubleshooting Common Issues

### Service Worker Not Registering

- Ensure paths are correct in your configuration
- Verify HTTPS or localhost is being used (required for service workers)
- Check browser console for errors

### Caching Issues

- Clear browser cache during development
- Use versioned cache names to refresh all caches when updating
- Add debugging logs in your service worker

### Updates Not Applying

- Ensure `skipWaiting` and `clientsClaim` are configured
- Add a version to your cache names
- Implement an update notification for users

### Cross-Origin Issues

- Ensure service worker scope is correctly set
- Make sure resources are from the same origin or CORS-enabled

## Conclusion

Implementing service workers in Next.js 15 provides robust offline capabilities and performance improvements. By following the steps in this guide, you can create a resilient web application that works even when the user's network connection is unreliable.

Remember to test thoroughly in both online and offline states, and consider the user experience when transitioning between these states.
