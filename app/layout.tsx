import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { buildNumber, lastUpdated } from "@/lib/build-info";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://findjobsnearby.com"),
  title: "FindJobsNearBy | Local work, without the runaround",
  description: "Free to post and apply for local jobs across Dallas-Fort Worth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "FindJobsNearBy",
          url: "https://findjobsnearby.com",
          description: "A Texas local job marketplace for small businesses and nearby job seekers.",
          email: "support@findjobsnearby.com",
        }).replace(/</g, "\\u003c") }} />
        {children}
        <footer className="border-t border-[var(--line)] bg-[var(--cream)] px-6 py-4 text-center text-xs text-[var(--muted)]">
          <div className="mb-2 flex flex-wrap justify-center gap-4 font-semibold">
            <a href="/about">About</a><a href="/plans">Plans</a><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a><a href="/refunds">Refunds</a>
          </div>
          FindJobsNearBy · Build {buildNumber} · Last updated {lastUpdated}
        </footer>
      </body>
    </html>
  );
}
