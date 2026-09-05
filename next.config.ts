import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

// No org/project/authToken set -- source maps won't upload, so stack traces
// in Sentry show minified code for now. Revisit once there's a Sentry auth
// token to enable that (needs org + project slugs from the Sentry dashboard).
export default withSentryConfig(nextConfig, { silent: !process.env.CI });
