import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/employer", "/auth"] },
    sitemap: "https://findjobsnearby.com/sitemap.xml",
  };
}
