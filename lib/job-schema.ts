import type { Job } from "@/lib/jobs";

const UNIT_PATTERNS: [RegExp, string][] = [
  [/\/\s*hr|hour/i, "HOUR"],
  [/\/\s*wk|week/i, "WEEK"],
  [/\/\s*mo|month/i, "MONTH"],
  [/\/\s*yr|year|annual/i, "YEAR"],
];

/** Best-effort parse of a free-text pay range (e.g. "$18-22/hr") into
 * schema.org's QuantitativeValue shape. Returns null when the text can't be
 * confidently parsed rather than inventing a unit Google might reject. */
function parsePayRange(pay: string) {
  const unit = UNIT_PATTERNS.find(([pattern]) => pattern.test(pay))?.[1];
  if (!unit) return null;

  const numbers = pay.match(/[\d,]+(?:\.\d+)?/g)?.map((n) => Number(n.replace(/,/g, ""))).filter((n) => !Number.isNaN(n));
  if (!numbers || numbers.length === 0) return null;

  const value = numbers.length >= 2
    ? { "@type": "QuantitativeValue", minValue: Math.min(...numbers), maxValue: Math.max(...numbers), unitText: unit }
    : { "@type": "QuantitativeValue", value: numbers[0], unitText: unit };

  return { "@type": "MonetaryAmount", currency: "USD", value };
}

export function buildJobPostingSchema(job: Job, canonicalUrl: string) {
  const baseSalary = parsePayRange(job.pay);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: "FindJobsNearBy", value: job.id },
    datePosted: job.postedAt.split("T")[0],
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    employmentType: job.employmentType.toUpperCase(),
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.city, addressRegion: job.state, addressCountry: "US" },
    },
    ...(baseSalary ? { baseSalary } : {}),
    directApply: true,
    url: canonicalUrl,
  };
}
