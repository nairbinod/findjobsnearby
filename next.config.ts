import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The combined candidate/employer toggle page is retired in favor of
      // two dedicated sign-in URLs (app/applicant/auth, app/employer/auth) --
      // this keeps any old bookmarks/links pointed at /auth working.
      { source: "/auth", destination: "/applicant/auth", permanent: true },
    ];
  },
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
