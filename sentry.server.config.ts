import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Local dev runs and re-runs the same flows constantly while testing --
  // only report from deployed environments so the dashboard stays signal, not noise.
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
});
