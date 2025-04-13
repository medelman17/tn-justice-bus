// Service worker for caching API requests

// Extend Event for TypeScript
interface FetchEvent extends Event {
  readonly request: Request;
  respondWith(response: Promise<Response>): void;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

self.addEventListener("fetch", (event) => {
  // Cast to FetchEvent to access fetch event properties
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(fetchEvent.request).then((response) => {
          const responseToCache = response.clone();

          caches.open("api-cache").then((cache) => {
            cache.put(fetchEvent.request, responseToCache);
          });

          return response;
        })
      );
    })
  );
});

self.addEventListener("install", (event) => {
  // Cast to ExtendableEvent to access waitUntil
  const extendableEvent = event as ExtendableEvent;
  extendableEvent.waitUntil(
    caches.open("api-cache").then((cache) => {
      return cache.addAll([
        // Add URLs of API endpoints to cache
        "/api/auth/session",
        "/api/data",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Cast to ExtendableEvent to access waitUntil
  const extendableEvent = event as ExtendableEvent;
  extendableEvent.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "api-cache") {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
