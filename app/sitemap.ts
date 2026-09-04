import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/jobs", "/about", "/plans", "/auth", "/post", "/privacy", "/cookies", "/terms", "/refunds"];
  return routes.map((route) => ({
    url: `https://findjobsnearby.com${route}`,
    lastModified: new Date("2026-09-03"),
    changeFrequency: route === "/jobs" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/jobs" ? 0.9 : 0.6,
  }));
}
