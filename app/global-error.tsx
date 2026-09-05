"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- global-error replaces
   the whole root layout, so next/link's router context can't be relied on */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-6 text-center">
        <div>
          <h1 className="display text-4xl font-bold">Something went wrong.</h1>
          <p className="mt-4 text-[var(--muted)]">We&apos;ve been notified and are looking into it. Try refreshing the page.</p>
          <a href="/" className="mt-6 inline-block rounded-full bg-[var(--coral)] px-6 py-3 text-sm font-bold text-white">Back to home</a>
        </div>
      </body>
    </html>
  );
}
