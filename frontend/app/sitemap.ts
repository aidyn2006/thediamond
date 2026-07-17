import type { MetadataRoute } from "next";
import { getPublicCreatorList } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

// Re-generate at most hourly; new approved creators appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const creators = await getPublicCreatorList();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...creators.map((c) => ({
      url: `${SITE_URL}/u/${c.id}`,
      lastModified: c.createdAt ? new Date(c.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
