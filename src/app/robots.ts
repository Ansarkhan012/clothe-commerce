import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let sitemap = "/sitemap.xml";

  if (configuredSiteUrl) {
    try {
      sitemap = `${new URL(configuredSiteUrl).origin}/sitemap.xml`;
    } catch {
      // Keep the same-origin fallback when deployment configuration is invalid.
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin-portal", "/api/"],
    },
    sitemap,
  };
}
