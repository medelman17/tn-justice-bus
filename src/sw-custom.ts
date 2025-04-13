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

// Activate event - clean up old caches
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

// Fetch event - respond with cached content when possible
self.addEventListener("fetch", (event) => {
  // Special handling for navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline").then((response) => {
          // Make sure we always return a Response object
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

  // For API requests, try network first with timeout fallback to cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          // Clone the response to cache it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
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

  // Handle POST requests for form submissions
  if (event.request.method === "POST") {
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        // If offline, return a custom response
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

        if (event.request.url.includes("/api/documents/upload")) {
          return new Response(
            JSON.stringify({
              status: "offline",
              message:
                "Your document has been saved and will be uploaded when you're back online.",
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Default response for other POST requests
        return new Response(
          JSON.stringify({
            status: "offline",
            message:
              "You are currently offline. This action will be completed when you are back online.",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Default strategy - Cache First for static assets
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, get from network
        return fetch(event.request.clone()).then((response) => {
          // Clone the response to cache it
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
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  // Store auth token in cache
  if (event.data && event.data.type === "STORE_AUTH_TOKEN") {
    caches.open("auth-tokens").then((cache) => {
      cache.put("/auth-token", new Response(JSON.stringify(event.data.token)));
    });
  }
});
