"use client";

import { useEffect, ReactNode } from "react";
import {
  initializeOfflineSystem,
  canFunctionOffline,
} from "@/lib/offline/offline-init";

interface OfflineProviderProps {
  children: ReactNode;
}

/**
 * OfflineProvider component
 *
 * This component initializes the offline capabilities of the application.
 * It should be used near the root of the component tree to ensure all
 * offline functionality is ready before the app renders.
 */
export function OfflineProvider({ children }: OfflineProviderProps) {
  useEffect(() => {
    // Check if offline mode is supported
    if (typeof window !== "undefined") {
      const offlineSupported = canFunctionOffline();

      if (offlineSupported) {
        // Initialize offline system if supported
        initializeOfflineSystem()
          .then(() => {
            console.log("Offline system initialized successfully");
          })
          .catch((error) => {
            console.error("Failed to initialize offline system:", error);
          });
      }
    }
  }, []);

  return <>{children}</>;
}
