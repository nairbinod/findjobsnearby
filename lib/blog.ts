export type ArticleSection = { heading: string; paragraphs: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  sections: ArticleSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "facebook-marketplace-jobs-vs-findjobsnearby",
    title: "Why post here instead of Facebook Marketplace?",
    description: "Facebook Marketplace was built for selling a couch, not filling a shift. Here's what a job board built for hiring actually gets you.",
    publishedAt: "2026-09-08",
    sections: [
      {
        heading: "A job board, not a garage sale with a jobs tab",
        paragraphs: [
          "Open Facebook Marketplace to post a job and you're in the same place someone else is listing a used couch, a car, or a bike. Jobs are one category buried inside a general classifieds app — which means the people scrolling through it aren't necessarily job hunting, they're browsing whatever's for sale nearby, and your opening happens to be mixed in.",
          "FindJobsNearBy only does one thing: local jobs. Every visitor is either hiring or looking for work, and that focus is the whole point — a listing doesn't have to compete with a dining table for attention from someone actually in the market for a shift.",
        ],
      },
      {
        heading: "A real application, not a Messenger thread",
        paragraphs: [
          "On Marketplace, \"applying\" usually means sending a Messenger DM, and \"reviewing applicants\" means scrolling back through a chat list trying to remember who said what. There's no structured profile, no consistent way to see availability or experience side by side, and nothing stopping the conversation from trailing off into other things Messenger is used for.",
          "Here, a candidate fills out the same short set of questions every time — role, availability, work history, desired pay — and an employer sees every applicant to a listing in one place, in the same format, with an optional checklist showing exactly which requirements each person says they meet. It's built to compare people, not just to message them.",
        ],
      },
      {
        heading: "Built to be found on Google, not just inside one app",
        paragraphs: [
          "A Marketplace listing mostly lives and dies inside Facebook's own app — it isn't built to surface in a Google search for \"restaurant jobs near me,\" and someone without an active Facebook account never sees it at all. That's a real ceiling on how many nearby candidates a listing can actually reach.",
          "Every listing on FindJobsNearBy is a real, indexable web page with the structured data Google looks for to surface local job postings — no account required to browse, and no walled garden between a listing and the search engine most people actually start with.",
        ],
      },
      {
        heading: "No personal profile required, on either side",
        paragraphs: [
          "Posting or applying on Marketplace means doing it from a personal Facebook account — the same one with your friends, your photos, and whatever else you've ever posted, now attached to a hiring conversation with a stranger. Plenty of people, on both sides, would rather keep those separate.",
          "Posting or applying here only ever needs an email — no personal account to log into, no profile to expose beyond what you chose to share for this one purpose. Posting stays free, applying stays free, and the only time money changes hands is when an employer is ready to unlock a specific candidate's full profile and start a real conversation.",
        ],
      },
    ],
  },
  {
    slug: "small-business-hiring-is-different",
    title: "Small business hiring is different — so the tool for it should be too",
    description: "Why a restaurant, salon, or repair shop filling one open role doesn't need the same tool as a company running a recruiting pipeline.",
    publishedAt: "2026-09-05",
    sections: [
      {
        heading: "You're not a recruiter. You're the owner.",
        paragraphs: [
          "When a national chain needs to hire, someone in HR opens a dashboard, sets up a requisition, and manages a pipeline of applicants over weeks. When a local restaurant needs a line cook, the person doing the hiring is usually the owner or the manager — squeezed in between running the register, managing a delivery, and everything else that keeps the doors open that day.",
          "Big job boards were built for the first kind of hiring. Sponsored placements, applicant tracking dashboards, resume-screening tools, multi-step posting flows — all of it assumes someone whose job is recruiting, with the time and budget to manage it. A small business owner filling one role doesn't need a recruiting system. They need the role filled.",
        ],
      },
      {
        heading: "Reach isn't the problem. Relevance is.",
        paragraphs: [
          "A national job board's whole pitch is scale — post once, reach millions. But a hyper-local hourly role doesn't benefit from a candidate three states away seeing it. What actually matters is whether the handful of people who live close enough to actually take the job ever see it.",
          "That's a fundamentally different problem than the one big boards are optimized to solve. It's closer to a community bulletin board than a national search engine — and it should feel that simple, both to post and to browse.",
        ],
      },
      {
        heading: "Fewer, better applicants beats a flood of generic ones",
        paragraphs: [
          "Anyone who's posted a role on a big general-purpose board knows the flood that follows — a lot of applications that were clearly sent to fifty other listings at once, with little connection to the actual job, the actual pay, or the actual location. Sorting through that costs time a small business owner doesn't have.",
          "A simpler, local-first platform trades that flood for a smaller number of applicants who are actually nearby, actually available, and actually applying to this specific role — not blasting a resume across every listing on the internet.",
        ],
      },
      {
        heading: "What \"simple\" actually means",
        paragraphs: [
          "Simple means posting a role in a few minutes with a handful of plain questions, not a form with dozens of fields borrowed from enterprise HR software. It means never paying just to advertise a position. It means only paying once you've actually found someone worth contacting — not for visibility, not for a subscription you have to remember to cancel.",
          "That's the whole idea behind FindJobsNearBy: free to post, free to apply, and a single small charge only when an employer is ready to unlock a candidate's full profile and start a real conversation. No dashboards to learn. No recruiting pipeline to manage. Just a faster way for a local business and a local candidate to find each other.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
