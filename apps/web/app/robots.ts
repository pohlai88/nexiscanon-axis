import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/(auth)/", "/admin/"],
      },
    ],
    sitemap: "https://nexuscanon.com/sitemap.xml",
  };
}
