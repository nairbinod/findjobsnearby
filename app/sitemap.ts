import type { MetadataRoute } from "next";
import { getAllJobs, jobHref } from "@/lib/jobs-data";
import { TX_METROS, citySlug, categorySlug, CATEGORIES } from "@/lib/geo";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/plans", changeFrequency: "monthly", priority: 0.6 },
  { path: "/post", changeFrequency: "monthly", priority: 0.7 },
  { path: "/employer-interest", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refunds", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const jobs = await getAllJobs();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `https://findjobsnearby.com${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const cityEntries: MetadataRoute.Sitemap = TX_METROS.map((city) => ({
    url: `https://findjobsnearby.com/jobs/${citySlug(city, "TX")}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const cityCategoryEntries: MetadataRoute.Sitemap = TX_METROS.flatMap((city) =>
    CATEGORIES.map((category) => ({
      url: `https://findjobsnearby.com/jobs/${citySlug(city, "TX")}/${categorySlug(category)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  );

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `https://findjobsnearby.com${jobHref(job)}`,
    lastModified: new Date(job.postedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...cityEntries, ...cityCategoryEntries, ...jobEntries];
}
