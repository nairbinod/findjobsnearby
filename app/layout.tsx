import type { Metadata } from "next";
import Link from "next/link";
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
        <footer className="border-t border-[var(--line)] bg-[var(--cream)]">
          <div className="mx-auto grid max-w-[1100px] gap-10 px-6 py-12 sm:grid-cols-3 lg:px-10">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Job Seekers</h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li><Link href="/jobs" className="hover:text-[var(--ink)]">Browse Jobs</Link></li>
                <li><Link href="/account" className="hover:text-[var(--ink)]">My Applications</Link></li>
                <li><Link href="/faq" className="hover:text-[var(--ink)]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">Employers</h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li><Link href="/post" className="hover:text-[var(--ink)]">Post a Job</Link></li>
                <li><Link href="/employers" className="hover:text-[var(--ink)]">How Hiring Works</Link></li>
                <li><Link href="/plans" className="hover:text-[var(--ink)]">Pricing</Link></li>
                <li><Link href="/employer" className="hover:text-[var(--ink)]">Employer Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">About</h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li><Link href="/about" className="hover:text-[var(--ink)]">About FindJobsNearBy</Link></li>
                <li><a href="mailto:support@findjobsnearby.com" className="hover:text-[var(--ink)]">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--line)]">
            <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs text-[var(--muted)] lg:px-10">
              <span>FindJobsNearBy · Build {buildNumber} · Last updated {lastUpdated}</span>
              <div className="flex flex-wrap gap-4 font-semibold">
                <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
                <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
                <Link href="/cookies" className="hover:text-[var(--ink)]">Cookies</Link>
                <Link href="/refunds" className="hover:text-[var(--ink)]">Refunds</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
