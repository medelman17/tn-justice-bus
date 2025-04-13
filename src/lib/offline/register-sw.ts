/**
 * registerServiceWorker - Registers the application's service worker
 * 
 * This function handles the registration of the service worker located at '/sw.js'.
 * Service workers act as proxy servers that sit between web applications,
 * the browser, and the network, enabling:
 * 
 * - Offline functionality: Caching resources for offline use
 * - Background syncing: Deferring actions until connectivity is restored
 * - Push notifications: Enabling web push notifications
 * - Content caching: Improving performance with custom cache strategies
 * 
 * The registration process:
 * 1. Checks if service workers are supported in the current browser
 * 2. Waits for the page to fully load before registering (window load event)
 * 3. Attempts to register the service worker at the /sw.js path
 * 4. Logs the result of the registration attempt
 * 
 * This is a core component of the offline-first strategy implemented in the
 * Tennessee Justice Bus application, working together with IndexedDB for
 * data persistence and synchronization mechanisms.
 */
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service worker registered:", registration);
        })
        .catch((registrationError) => {
          console.error(
            "Service worker registration failed:",
            registrationError
          );
        });
    });
  } else {
    console.log("Service workers are not supported.");
  }
}
