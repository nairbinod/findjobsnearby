import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { buildNumber, lastUpdated } from "@/lib/build-info";
import ReferralCapture from "@/components/ReferralCapture";
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
  openGraph: {
    type: "website",
    siteName: "FindJobsNearBy",
    title: "FindJobsNearBy | Local work, without the runaround",
    description: "Free to post and apply for local jobs across Dallas-Fort Worth.",
    url: "https://findjobsnearby.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindJobsNearBy | Local work, without the runaround",
    description: "Free to post and apply for local jobs across Dallas-Fort Worth.",
  },
  verification: {
    google: "c4WsnhxMgwVyinl9yxL_ofUGWVwFhZ4d2EIe7vbcGWg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FindJobsNearBy",
            url: "https://findjobsnearby.com",
            description: "A Texas local job marketplace for small businesses and nearby job seekers.",
            email: "support@findjobsnearby.com",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "FindJobsNearBy",
            url: "https://findjobsnearby.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://findjobsnearby.com/jobs?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ]).replace(/</g, "\\u003c") }} />
        <ReferralCapture />
        {children}
        <footer className="border-t border-[var(--line)] bg-[var(--cream)] px-6 py-4 text-center text-xs text-[var(--muted)]">
          <div className="mb-2 flex flex-wrap justify-center gap-4 font-semibold">
            <a href="/about">About</a><a href="/employers">For employers</a><a href="/plans">Plans</a><a href="/faq">FAQ</a><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a><a href="/refunds">Refunds</a>
          </div>
          FindJobsNearBy · Build {buildNumber} · Last updated {lastUpdated}
        </footer>
      </body>
    </html>
  );
}
