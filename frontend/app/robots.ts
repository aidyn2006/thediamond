import type { MetadataRoute } from "next";

const siteUrl = "https://thediamond.kz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/login",
          "/register",
          "/onboarding",
          "/profile",
          "/my-applications",
          "/pending",
          "/campaigns",
          "/campaigns/",
          "/creators",
          "/creators/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
