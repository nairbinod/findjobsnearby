
# Product Requirements Document
## FindJobsNearBy — Phase 1
### Texas Small-Business Job Marketplace

**Status:** Phase 1 — Ready for build
**Domain:** findjobsnearby.com
**Owner:** Binod

---

## 1. Overview

A free-to-post, free-to-apply job marketplace for Texas small businesses. Employers pay $2.99 only when they choose to view a candidate's full profile and open messaging. AI agents draft job listings and candidate profiles from minimal user input on both sides. A single paid subscription (Growth) launches in Phase 2 for repeat-hiring employers.

**Initial market:** Dallas–Fort Worth (launch metro), expanding by metro density across Texas — Houston next. SEO infrastructure is built statewide from day one; go-to-market effort stays concentrated in one city until liquidity is proven (see §10).

---

## 2. Goals & Success Metrics

| Phase | Metric | Target |
|---|---|---|
| Month 1–2 (seed) | Active job listings in launch city | 50+ |
| Month 1–2 (seed) | Applications per active listing | 5+ |
| Month 3–6 | Paid contact conversion rate (jobs that buy ≥1 view, excluding views covered by the free-trial allowance in US-53) | Track vs. 35% model assumption |
| Month 3–6 | Employer month-2 retention (repeat posting) | Track — feeds Phase 2 pricing |
| Month 6 | Organic (non-paid) traffic share | Track — validates SEO investment |
| Month 1+ | Subscription attach rate among repeat employers | Track vs. CAC payback model |

---

## 3. Personas

**Employer — "Maria, restaurant owner"**
Hires 1–4x/month, no recruiting software experience, wants to fill a role fast without spending $200+ on a listing. Time-poor; will abandon any signup flow with more than a few fields.

**Candidate — "Jordan, hourly/local job seeker"**
Applies to many jobs, frustrated by long forms and reposted/fake listings, wants to know an employer is actually responsive.

---

## 4. User Stories — Phase 1

### 4.1 Employer account & job posting

- **US-1:** As an employer, I want to create an account with minimal fields (email or phone), so I can start posting without friction.
- **US-2:** As an employer, I want to submit minimal structured input for a job (title, pay range, location, 3–5 responsibility bullets, employment type), so I don't have to write a full listing myself.
  - *AC:* Pay range is a required field.
- **US-3:** As an employer, I want an AI agent to draft the full listing from my input, so I get a polished posting with minimal effort.
  - *AC:* AI does not invent facts I didn't state; unstated fields are left blank, not filled in.
- **US-4:** As an employer, I want to review and edit the AI-drafted listing before it publishes, so nothing goes live without my approval.
- **US-5:** As an employer, I want posting to always be free, so I never pay just to advertise a position.
- **US-54:** As an employer, I want to edit a published listing's details, so I can fix mistakes or update information without re-posting from scratch.
  - *AC:* Same guardrails as original posting apply (§5) — pay range still required, 3–5 responsibilities, no contact info. Edits take effect immediately; no separate admin review, matching the original posting flow's own-approval model.
- **US-55:** As an employer, I want to close a listing before it expires, so candidates stop applying to a role I've already filled.
  - *AC:* A closed listing is removed from search, browse, and category pages immediately. Its URL stays reachable (no broken links from shares or search results) but shows a clear "no longer accepting applications" state instead of the apply form. Existing applications and any paid profile unlocks remain visible to the employer as a historical record.
- **US-57:** As an employer, I want to add a street address to my listing, so candidates know exactly where to show up, not just the city.
  - *AC:* Address is optional — an employer who doesn't want to publish an exact location can leave it blank and the listing still shows city/state as before. When provided, it appears on the job detail page and feeds the `streetAddress` field of the listing's JobPosting structured data.
- **US-58:** As an employer, I want to mark a listing as "Urgently Hiring," so candidates notice it needs to be filled fast.
  - *AC:* The flag is a simple toggle available at posting and at any later edit. When set, an "Urgently Hiring" badge appears everywhere the listing is shown to candidates — job detail page, browse/search results, city and category pages, the homepage feed, and the downloadable share image.
- **US-59:** As an employer, I want to optionally convert my job's requirements into a short checklist (e.g., "reliable transportation," "available weekends," "2+ years experience") instead of relying only on free text, so expectations are explicit and applicants can self-assess before applying.
  - *AC:* Optional and capped at 3–6 items — skippable entirely, so it never blocks the free, minimal-friction posting flow (§3). The AI drafting assistant (US-3) may suggest checklist items from what the employer already typed, but each item must be individually reviewed and confirmed by the employer before saving — nothing is auto-published unconfirmed, consistent with §5's human-approval guardrail.
  - *AC:* Displayed on the public job listing page itself, not only inside the apply flow, so a candidate can self-assess before starting an application. Also feeds `qualifications`/`skills` in the listing's JobPosting structured data (§6), improving Google for Jobs eligibility.

### 4.2 Multi-role job postings

- **US-6:** As an employer with multiple simultaneous openings (e.g., a contractor needing an electrician, a plumber, and an accountant), I want to add each role one at a time in a single session, so I don't repeat the full posting flow per role.
  - *AC:* Each role gets its own pay range, own URL, and its own independent lifecycle (one role can expire while others stay open).

### 4.3 Candidate account & profile creation

- **US-7:** As a candidate, I want to create an account with minimal fields, so I can start applying quickly.
- **US-8:** As a candidate, I want to answer a short structured Q&A (work history, availability, desired role/pay), so I don't have to write a full resume.
- **US-9:** As a candidate, I want an AI agent to draft a curated profile from my input, so I present clearly without writing it myself.
  - *AC:* No invented facts; no evaluative claims (no "strong candidate," no inferred seniority).
- **US-10:** As a candidate, I want to review and approve my profile before any employer can see it, so I control what represents me.

### 4.4 Multiple candidate profiles (seasonal workforce)

- **US-11:** As a candidate who works different seasonal roles (e.g., store clerk in one season, substitute teacher in another), I want multiple role-specific profiles under one account, so each application shows focused, relevant information.
  - *AC:* Max 3–5 profiles per account. Each has its own AI-curated content and availability window. Identity and verification stay account-level, not per-profile.
- **US-12:** As an employer, I want to see only the profile a candidate applied with for my job, not their other profiles, so candidate privacy is respected.

### 4.5 Applying to jobs

- **US-13:** As a candidate, I want to apply to jobs for free using an existing profile or a new role-specific one, so applying never costs me anything.
- **US-14:** As a candidate, I want to search/filter jobs by city, category, and pay range, so I can find relevant openings quickly.
- **US-60:** As a candidate, I want to check off which of a job's requirements I meet when applying, so I can quickly signal fit without writing a full response for each one.
  - *AC:* An optional free-text box remains available for additional context per application, separate from and in addition to the checklist.
  - *AC:* Leaving items unchecked never blocks submission — a candidate can apply having met 0 of the listed requirements if they choose to.
  - *AC:* Submission requires checking a separate attestation box ("My selections above are truthful to the best of my knowledge") before the application can be sent — this is required, not optional, since it's what gives US-61's "self-reported, not verified" disclosure real weight rather than just a legal hedge.

### 4.6 Discovering & paying to contact candidates

- **US-15:** As an employer, I want to browse applicants' AI-curated profiles for free, so I can decide who's worth contacting before paying anything.
- **US-16:** As an employer, I want to pay $2.99 to view a specific candidate's full profile and open messaging, so I only pay once I've found someone worth talking to.
  - *AC:* No candidate contact info is visible anywhere pre-payment. Paying to view a profile unlocks it for me permanently, even if it resurfaces through another of my own job posts. The first two views are free per US-53, before this $2.99 charge ever applies.
- **US-17:** As an employer, I want to buy discounted credit packs (5 views for $10, or 10 views for $20), so I save money contacting multiple candidates.
- **US-18:** As an employer, I want in-app messaging with a candidate once I've paid to view their profile, so we can communicate directly.
- **US-53:** As a new employer, I want my first 2 profile views to be free, so I can try the paid-contact flow before spending anything.
  - *AC:* The allowance is scoped to the employer's account, not per job post — posting additional jobs does not reset or multiply it, and it is a one-time lifetime allowance, not renewed monthly. A free-trial view unlocks the candidate's profile and messaging exactly like a paid one (US-16) — same permanent access, just $0 charged; it is not a separate or time-limited access mode. Once both free views are used, every subsequent view costs $2.99, or draws from a credit pack (US-17) or Growth's included views (US-36) if the employer has either. Applies uniformly regardless of tier — it's the trial hook that runs before any paid plan, not a Growth perk.

### 4.7 Job boosting

- **US-19:** As an employer, I want to pay $10 to boost my listing for 7 days or $25 for 30 days, so it stands out without changing my free base listing.
- **US-20:** As an employer with a boosted listing, I want to view all applicants for free with no per-view charge, so a popular listing doesn't force me to ration who I contact.
  - *AC:* Applicant volume for any job is capped at 20–30 total applications.

### 4.8 Applicant management

- **US-21:** As an employer, I want to see application counts and filter my applicant pool by profile category and availability, so I can manage a job's applicants without needing a full ATS.
- **US-21a:** As an employer, I want to see how many unique people have viewed my job listing, so I can gauge interest even before anyone applies.
  - *AC:* Counts unique visitors, not raw page loads. Free for all employers (Phase 1). Distinct from Growth's deeper "analytics" perk (§4.16), which covers trends and view-to-application conversion over time — this is the basic count, not the dashboard.
- **US-61:** As an employer, I want to see each applicant's requirement match as a visible breakdown (e.g., "7 of 9 met," with which ones), so I can scan applicants faster.
  - *AC:* Informational only — applicants are never auto-sorted, ranked, filtered, or scored based on this breakdown. All applicants remain visible regardless of match count, and no composite "score" is calculated or displayed.
  - *AC:* Match data is self-reported by the candidate and is not independently verified by the system.
  - *AC:* Free for all employers, matching the existing free applicant-filtering baseline (US-21) — not a Growth-exclusive feature.

### 4.9 Notifications

- **US-22:** As an employer, I want to be notified of new applications, so I know to review them.
- **US-23:** As a candidate, I want to be notified when an employer pays to view my profile, so I know someone is interested.
- **US-24:** As a candidate with a seasonal profile, I want to be notified when season-appropriate jobs return, so I don't have to remember to check back.
- **US-52:** As a job seeker visiting the homepage, I want to sign up with just my email to get notified about new job postings, so I can hear about opportunities without creating a full account first.
  - *AC:* Requires only an email address — no password, no profile, no full account. Distinct from full candidate signup (§4.3) and from the seasonal-profile matching in US-24, which requires an approved profile; this is a lower-friction, top-of-funnel option available to anonymous visitors. An optional category filter narrows which postings trigger an alert; an unfiltered signup gets all new listings. Sent via Resend (§9) as a periodic digest, not one email per listing, with an unsubscribe link on every send.

### 4.10 Trust & safety

- **US-25:** As an employer, I want to verify my account (phone number at minimum) and display a "Verified" badge, so candidates trust I'm a real business.
- **US-26:** As a candidate, I want to verify my phone number, so employers trust I'm a real applicant.
- **US-27:** As a candidate or employer, I want the platform to automatically detect and block contact info (phone/email) in listings and applications, so the payment gate can't be routed around.
- **US-28:** As an employer or candidate, I want to report/flag a listing or profile, so the platform stays trustworthy.
- **US-29:** As an employer, I want to dispute/request a refund for a paid contact that goes unanswered, so I'm not stuck paying for a dead end.
- **US-30:** As a platform admin, I want a moderation dashboard for flagged content, employer verification review, and disputes, so trust & safety policies are actually enforced.

### 4.11 Listing freshness

- **US-31:** As an employer, I want to be prompted to renew or confirm my listing after 14–30 days, so stale listings don't sit unmanaged.
  - *AC:* Inactive listings auto-expire.

### 4.12 Job listing video

Deferred to Phase 2 — see §12. Phase 1 ships a static downloadable share image (built and live) as the free, lower-effort substitute for US-32's video.

### 4.13 Referral

- **US-34:** As a candidate, I want a simple referral link to share with businesses I know are hiring, so I can help bring new employers to the platform.

### 4.14 Founder-assisted onboarding (internal)

- **US-35:** As the founder/admin, I want an internal version of the AI-listing tool to submit input and publish on an employer's behalf, so I can manually seed the launch market.

### 4.15 Homepage & landing page

- **US-38:** As a visitor, I want the homepage to be SEO-optimized (server-rendered, structured data, fast-loading), so it ranks well and loads quickly from organic search.
- **US-39:** As a job seeker, I want clear, one-click access from the homepage to search or browse jobs, so I can start looking immediately without hunting through a generic menu.
  - *AC:* The homepage also carries the low-friction job-alert email signup from US-52 (§4.9) for visitors not ready to browse yet.
- **US-40:** As an employer, I want clear, one-click access from the homepage to post a job, so I can start immediately without hunting for the right entry point.
  - *AC:* Both paths are equally prominent on the homepage — neither audience is the default and the other an afterthought.

### 4.16 Growth subscription

- **US-36:** As a repeat-hiring employer, I want to subscribe to Growth ($39.99/mo, 25 included profile views plus advanced search, saved candidates, messaging, applicant management, multiple recruiter seats, 2 boosts/month, and analytics), so I don't pay per-view every time I hire.
  - *AC:* "Analytics" here means trends over time and view-to-application conversion rate — the basic unique-view count itself (US-21a) is free for everyone, not a Growth-exclusive.
- **US-37:** As a Growth subscriber, I want overage views beyond my 25 included to bill at a discounted rate, so I'm not cut off in a busy month.

**Pitch line:** *"Free to post and apply, plus your first 2 candidate views are on us — after that it's $2.99 to view an application, or go Growth for $39.99/month and get 25 views included plus team tools."*

### 4.17 Company & legal pages

- **US-41:** As a visitor, I want an About Us page explaining who FindJobsNearBy is and why it exists, so I can trust the platform before signing up.
- **US-42:** As an employer considering the platform, I want a dedicated Employer page explaining pricing, features, and how posting works, so I can evaluate the platform before creating an account.
  - *AC:* Distinct from the homepage's one-click CTA (§4.15) — this is the deeper marketing/explainer page a search visitor or referral link lands on.
- **US-43:** As a user, I want Terms of Service, Privacy Policy, and a Refund/Dispute policy page, so I understand my rights and the platform's practices before using it.
  - *AC:* Refund/Dispute page documents the process behind US-29 (§4.10). Privacy Policy documents the data-minimization practices from §7. AI-content disclosure (§5) is explained here in full, not just shown inline on listings.
- **US-44:** As a search engine or a legally-required party, I want all company/legal pages server-rendered and indexed, so they meet the same SEO/compliance bar as job listings.

### 4.18 Resources: blog, guides, FAQ

- **US-45:** As a job seeker or employer researching before I commit, I want a blog with articles relevant to my situation (e.g., "how to find seasonal work in Dallas," "how to write a job listing that gets applicants"), so I get useful content and the platform builds organic search authority.
  - *AC:* Each post server-rendered, own permanent URL, `Article` structured data (schema.org).
- **US-46:** As a visitor, I want structured how-to guides (e.g., "How Hiring on FindJobsNearBy Works," "A Job Seeker's Guide to Seasonal Work in Texas"), so I have a clear, deep reference beyond short blog posts.
- **US-47:** As a visitor with a common question, I want a FAQ page that answers it directly, so I don't have to contact support or dig through other pages.
  - *AC:* `FAQPage` structured data (schema.org) for search-snippet eligibility.
- **US-48:** As the platform operator, I want any AI-assisted blog/guide/FAQ content to follow the same guardrails as listings and profiles (§5), so nothing published makes unverified or invented claims.
- **US-49:** As a visitor reading the blog or resources, I want to subscribe to a newsletter, so I get updates without having to check back manually.
  - *AC:* Sent via Resend (§9).

### 4.19 My Applications (candidate)

- **US-50:** As a candidate, I want a list of every job I've applied to, so I can track my applications in one place.
  - *AC:* Shows job title, employer, date applied, and which of my profiles I applied with (relevant if I have multiple — §4.4).
- **US-51:** As a candidate, I want to see whether an employer has viewed my profile for each application, so I know if I've actually been seen, not just added to a queue.
  - *AC:* "Viewed" reflects the same paid-view event as the notification in US-23 (§4.9) — an employer paying to view my full profile (US-16), not merely appearing in an employer's free-preview browse list (US-15), which happens for every application and isn't a meaningful signal.
- **US-56:** As a candidate, I want to withdraw an application I've submitted, so I can remove it if my circumstances change.
  - *AC:* A withdrawn application is marked as such for the employer, not silently deleted — if they already reviewed or paid to unlock the profile, that history stays visible. Withdrawing does not refund a paid unlock (US-16), since the unlock is a permanent, account-level entitlement (US-16's AC), not tied to a single application's lifecycle.

---

## 5. AI Agent Guardrails (applies to listings, profiles, and video — §4.1–4.3, 4.12)

- Source-grounded only: format and organize what the user stated; never infer, evaluate, or score.
- Unstated fields are left blank, not filled with generic content.
- Required-field enforcement for pay range.
- Automated screening for legally risky or biased phrasing (age-coded, gendered, exclusionary language) — flagged for user edit, never silently rewritten.
- Mandatory human review/approval before any listing, profile, or video goes live.
- AI-generated content is disclosed to end users as such.

---

## 6. SEO Requirements

- Server-side rendering on all public listing and search pages — no client-side-only rendering of core content.
- `JobPosting` structured data (schema.org) on every listing, formatted for Google for Jobs eligibility.
- One permanent URL per listing (e.g., `/jobs/dallas-tx/restaurant-server-abc123`).
- Programmatic city × category landing pages for every major Texas metro from launch.
- Listings auto-expire/renew per §4.11 to avoid stale-content penalties.
- XML sitemap auto-generated and resubmitted as listings change; `robots.txt` configured correctly.
- Core Web Vitals targets met on listing and search page templates specifically.
- AI-generated listings avoid templated sameness across employers.
- Canonical tags on any listing reachable via multiple URL paths.
- Company, legal, and resource pages (§4.17, §4.18) follow the same SSR and structured-data bar as job listings — `Article` schema on blog posts, `FAQPage` schema on the FAQ.

---

## 7. Non-Functional Requirements

- **Compliance:** required pay-range field on all listings; standard PII handling for candidate data.
- **Data minimization:** store only what's needed for matching/contact; no collection of sensitive data the platform has no use for.
- **Performance:** sub-2-second listing page load on mobile.
- **Accessibility:** WCAG 2.1 AA baseline on public-facing pages.

---

## 8. Out of Scope for MVP

- Multi-state expansion
- Native mobile apps (mobile-responsive web first)
- Full ATS-style workflows
- Resume parsing from uploaded PDFs

---

## 9. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ / TypeScript / Tailwind |
| Database + Auth + Realtime | Supabase (Postgres); Row Level Security gates candidate contact info until payment/credit is recorded |
| Hosting | Vercel |
| Payments | Stripe — one-off charges, credit packs, boosts, and Phase 2 subscription billing |
| AI generation | Claude API, called server-side only |
| App-triggered email (transactional + newsletter) | Resend — handles both notification emails (§4.9) and blog/newsletter sends (§4.18) via one API |
| Company email (human-read inboxes) | Zoho Mail (mail.zoho.com) — support@, hello@, etc.; not used for app-triggered sending |
| Analytics | PostHog — free tier (1M events/mo) covers funnel tracking for the Goals table metrics in §2 (paid-contact conversion, retention, subscription attach rate) and powers the unique-view-count feature (US-21a) |
| Monitoring | Sentry |
| Dev approach | Claude Code |

---

## 10. Rollout Plan

1. **Weeks 1–4:** Manual employer seeding in Dallas–Fort Worth; founder-run onboarding (§4.14); AI tools founder-assisted, not self-serve.
2. **Weeks 4–8:** Self-serve employer signup opens; SEO scaffolding (city pages, structured data, sitemap) live statewide even with sparse content.
3. **Month 3+:** Liquidity checkpoint (50+ active listings, 5+ applications/listing) before expanding to a second metro.
4. **Month 4–6:** Houston launch; begin tracking real conversion data against the unit-economics model.
5. **Ongoing:** Once real "views purchased per employer per month" data exists, revisit Growth tier pricing with actual numbers.

---

## 11. Open Questions

- Growth tier overage price ($2.25/view) not independently validated — confirm before launch. Higher-stakes now that Growth ships with Phase 1 rather than after usage data exists.
- How much of "candidate search" the Free tier gets before it cannibalizes the reason to upgrade to Growth.
- Whether multi-metro expansion eventually needs per-city social accounts instead of one central account (§12).

---

## 12. Phase 2 Backlog

- **US-32:** As an employer, I want a short auto-generated video of my listing that I can download for free, so I can share it on my own social media.
  - *AC:* Phase 1 shipped a static downloadable share image as the free substitute (§4.12) — this revisits actual video once there's bandwidth beyond that.
- **US-33:** As an employer with a boosted listing, I want my video also posted to FindJobsNearBy's own TikTok/Instagram/Facebook accounts, so I get extra exposure beyond the platform itself.
  - *AC:* Posting to these accounts is manual (admin-uploaded), not API-automated, even once built. Depends on US-32 and on US-19/20 (job boosting) existing first.
