export function GET() {
  const content = `# FindJobsNearBy

> FindJobsNearBy is a Texas local job marketplace for small businesses and nearby job seekers.

## What it does
- Employers post jobs for free.
- Candidates browse local jobs and apply for free.
- Employers can review submitted candidate profiles.
- AI-assisted listing and profile drafts use only information provided by the user and require human approval.
- The initial launch market is Dallas-Fort Worth, Texas.

## Plans and pricing
- Free: job posting and job applications cost $0.
- Growth: planned at $39.99/month with 25 included profile views, advanced search, saved candidates, messaging, applicant management, recruiter seats, boosts, and analytics.
- Growth billing is not currently active.

## Public pages
- [Homepage](https://findjobsnearby.com/)
- [Find jobs](https://findjobsnearby.com/jobs)
- [About](https://findjobsnearby.com/about)
- [Plans](https://findjobsnearby.com/plans)
- [Post a job](https://findjobsnearby.com/post)
- [Privacy Policy](https://findjobsnearby.com/privacy)
- [Cookie Policy](https://findjobsnearby.com/cookies)
- [Terms of Service](https://findjobsnearby.com/terms)
- [Refunds and disputes](https://findjobsnearby.com/refunds)

## Contact
- support@findjobsnearby.com
`;

  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
