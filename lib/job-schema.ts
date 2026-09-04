import type { Job } from "@/lib/jobs";
import { parsePayNumbers } from "@/lib/pay";

/** Best-effort parse of a free-text pay range (e.g. "$18-22/hr") into
 * schema.org's QuantitativeValue shape. Returns null when the text can't be
 * confidently parsed rather than inventing a unit Google might reject. */
function parsePayRange(pay: string) {
  const parsed = parsePayNumbers(pay);
  if (!parsed) return null;
  const { unit, numbers } = parsed;

  const value = numbers.length >= 2
    ? { "@type": "QuantitativeValue", minValue: Math.min(...numbers), maxValue: Math.max(...numbers), unitText: unit }
    : { "@type": "QuantitativeValue", value: numbers[0], unitText: unit };

  return { "@type": "MonetaryAmount", currency: "USD", value };
}

export function buildJobPostingSchema(job: Job, canonicalUrl: string) {
  const baseSalary = parsePayRange(job.pay);
  // A closed or expired job must not read as still-active to Google for Jobs
  // -- back-date validThrough to "now" regardless of the original expiry.
  const validThrough = job.status !== "published" ? new Date().toISOString() : job.expiresAt;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: "FindJobsNearBy", value: job.id },
    datePosted: job.postedAt.split("T")[0],
    ...(validThrough ? { validThrough } : {}),
    employmentType: job.employmentType.toUpperCase(),
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.address ? { streetAddress: job.address } : {}),
        addressLocality: job.city,
        addressRegion: job.state,
        addressCountry: "US",
      },
    },
    ...(baseSalary ? { baseSalary } : {}),
    directApply: true,
    url: canonicalUrl,
  };
}
