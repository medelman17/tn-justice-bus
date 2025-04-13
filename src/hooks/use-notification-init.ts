"use client";

import { useEffect } from "react";
import { setupOfflineSync } from "@/lib/offline/offline-utils";

/**
 * Hook to initialize notification system and set up offline sync
 * This hook should be used in the app layout or top-level component
 * that runs on the client side
 *
 * @returns void
 */
export function useNotificationInit(): void {
  useEffect(() => {
    // Initialize notification system when app loads
    console.log("Initializing notification system...");

    // Set up offline sync for when connectivity is restored
    setupOfflineSync();

    // Set up event listener to check notification queue on visibility change
    // This helps process queued notifications when tab becomes active again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        console.log(
          "Tab is visible and online, checking notification queue..."
        );
        // The actual processing is handled by setupOfflineSync on the 'online' event
        // But we can force a check by dispatching a custom event
        window.dispatchEvent(new Event("online"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up event listener
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
