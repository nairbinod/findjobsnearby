import type { ArticleSection } from "@/lib/blog";

export type Guide = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  sections: ArticleSection[];
};

export const guides: Guide[] = [
  {
    slug: "how-hiring-on-findjobsnearby-works",
    title: "How hiring on FindJobsNearBy works",
    description: "A step-by-step walkthrough of posting a role, reviewing applicants, and unlocking a candidate's full profile.",
    publishedAt: "2026-09-05",
    sections: [
      {
        heading: "1. Post your role — free, always",
        paragraphs: [
          "Fill in the basics: business name, job title, pay range, city, employment type, and 3-5 responsibilities. That's it — no account fees, no cost to post, and no limit on how many roles you post.",
          "You can optionally add a street address, mark the role as Urgently Hiring, and list requirements candidates can check themselves against before applying.",
        ],
      },
      {
        heading: "2. Review the AI-drafted listing before anything goes live",
        paragraphs: [
          "An AI assistant turns what you typed into a clear, readable listing — using only the facts you provided. It never invents responsibilities, benefits, or requirements you didn't mention, and it flags any wording that might be exclusionary or legally risky so you can fix it yourself.",
          "Nothing publishes until you approve it. If you listed requirements, the same assistant rephrases each one as a simple yes/no question candidates can check off — you can edit any of those before saving too.",
        ],
      },
      {
        heading: "3. Candidates apply for free, with a focused profile",
        paragraphs: [
          "Candidates build a short, role-specific profile instead of uploading a generic resume. You can browse every applicant's AI-curated profile for free — role, availability, and a summary of their background — before deciding who's worth contacting.",
          "If a role listed requirements, you'll also see which ones each candidate checked off, so you can scan for fit faster. That's informational only — applicants are never ranked, scored, or filtered out based on it. Every applicant stays visible.",
        ],
      },
      {
        heading: "4. Unlock a candidate's full profile — the only thing that costs money",
        paragraphs: [
          "Browsing candidates is always free. When you find someone worth contacting, unlocking their full profile and messaging costs $2.99 — and your first two unlocks are free, for the lifetime of your account, so you can try it before spending anything.",
          "An unlock is permanent: once you've paid for a candidate, you can message them and see their full details anytime afterward, even if they apply to another one of your future postings.",
        ],
      },
      {
        heading: "5. Manage the role until it's filled",
        paragraphs: [
          "Edit your listing anytime — the same guardrails apply, and changes go live immediately. Close it the moment you've filled the role so it stops accepting applications, or let it auto-renew reminders keep you posted before it expires after 30 days.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
