import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Public: "/" (landing) and "/u/*" (creator profiles). Everything else
        // is auth-gated or thin and must stay out of the index.
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard",
          "/onboarding",
          "/pending",
          "/profile",
          "/my-applications",
          "/campaigns",
          "/creators",
          "/wallet",
          "/notifications",
          "/reward",
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
