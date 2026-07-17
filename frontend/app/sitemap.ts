import type { MetadataRoute } from "next";
import { getPublicCreators } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { CATEGORIES, categorySlugs } from "@/lib/categories";

// Re-generate at most hourly; new approved creators appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const creators = await getPublicCreators();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/catalog/${categorySlugs[c]}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...creators.map((c) => ({
      url: `${SITE_URL}/u/${c.id}`,
      lastModified: c.createdAt ? new Date(c.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
