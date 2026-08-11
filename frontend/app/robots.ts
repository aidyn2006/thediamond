import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Public: "/" (landing), "/listings/*" (catalog + listing pages) and
        // "/u/*" (seller pages). Everything else is auth-gated or thin.
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/listings/new",
          "/my-listings",
          "/deals",
          "/favorites",
          "/onboarding",
          "/profile",
          "/notifications",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
