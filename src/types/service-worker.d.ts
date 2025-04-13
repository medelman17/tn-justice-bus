/// <reference lib="webworker" />

// Declare service worker globals
declare global {
  interface Window {
    __SW_MANIFEST: Array<{
      url: string;
      revision: string | null;
    }>;
  }
}

// For TypeScript type checking inside the service worker file
export type {};
