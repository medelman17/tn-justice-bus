// Service worker for caching API requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          const responseToCache = response.clone();

          caches.open("api-cache").then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
      );
    })
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(
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
  event.waitUntil(
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
