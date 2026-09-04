import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // "/employer$" (not "/employer") avoids prefix-matching the public
    // /employers and /employer-interest pages.
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/employer$", "/auth", "/admin"] },
    sitemap: "https://findjobsnearby.com/sitemap.xml",
  };
}
