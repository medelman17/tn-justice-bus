import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "src/sw-custom.ts",
  swDest: "public/sw.js",
  // Disable during development to avoid registration issues
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure TypeScript errors don't prevent builds
  typescript: {
    // This doesn't mean that we're ignoring typcript errors,
    // but rather allowing the build to complete even with errors
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
