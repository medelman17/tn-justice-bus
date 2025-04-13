"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { OfflineProvider } from "./offline-provider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers component
 *
 * A wrapper component that includes all application providers.
 * This ensures consistent provider ordering and simplifies the root layout.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <OfflineProvider>{children}</OfflineProvider>
    </SessionProvider>
  );
}
