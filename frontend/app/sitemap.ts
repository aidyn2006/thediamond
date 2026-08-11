import type { MetadataRoute } from "next";
import { getPublicListings, getPublicSellers } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { PHONE_BRANDS, brandSlugs } from "@/lib/phones";

// Re-generate at most hourly; new approved listings appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, sellers] = await Promise.all([
    getPublicListings(),
    getPublicSellers(),
  ]);
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/listings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...PHONE_BRANDS.map((b) => ({
      url: `${SITE_URL}/listings/brand/${brandSlugs[b]}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // Listings are the money pages: one URL each, freshest first.
    ...listings.map((l) => ({
      url: `${SITE_URL}/listings/${l.id}`,
      lastModified: l.createdAt ? new Date(l.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...sellers.map((s) => ({
      url: `${SITE_URL}/u/${s.id}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
