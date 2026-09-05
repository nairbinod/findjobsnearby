import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

// authToken comes from SENTRY_AUTH_TOKEN (a secret -- never hardcode it here).
// Without it, source-map upload silently no-ops and Sentry just shows
// minified stack traces, so this stays safe to deploy before that's set.
export default withSentryConfig(nextConfig, {
  org: "nearby-je",
  project: "findjobsnearby",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
