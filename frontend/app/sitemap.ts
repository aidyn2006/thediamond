import type { MetadataRoute } from "next";
import { getPublicListings, getPublicSellers } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { listingPath } from "@/lib/listing-url";
import { PHONE_BRANDS, brandSlugs } from "@/lib/phones";
import { CITY_HUBS, brandCityPath, cityPath } from "@/lib/geo";
import { groupByModel } from "@/lib/models";
import { GUIDES } from "@/lib/guides";

// Re-generate at most hourly; new approved listings appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, sellers] = await Promise.all([
    getPublicListings(),
    getPublicSellers(),
  ]);
  const now = new Date();

  // Geo and model pages are only worth submitting when they have something on them —
  // an empty hub is a thin page, and thin pages drag the whole site's crawl budget.
  const citiesWithStock = new Set(listings.map((l) => l.city));
  const brandCityPairs = new Set(listings.map((l) => `${l.brand}|${l.city}`));
  const models = groupByModel(listings);

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
    {
      url: `${SITE_URL}/sell`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/exchange`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...PHONE_BRANDS.map((b) => ({
      url: `${SITE_URL}/listings/brand/${brandSlugs[b]}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // City hubs: every city stays listed (they're the geo landing pages), but the ones
    // with stock get a higher priority.
    ...CITY_HUBS.map((c) => ({
      url: `${SITE_URL}${cityPath(c)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: citiesWithStock.has(c.name) ? 0.8 : 0.4,
    })),
    // Brand × city only where such a listing actually exists.
    ...CITY_HUBS.flatMap((c) =>
      PHONE_BRANDS.filter((b) => brandCityPairs.has(`${b}|${c.name}`)).map((b) => ({
        url: `${SITE_URL}${brandCityPath(brandSlugs[b], c)}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ),
    ...models.map((m) => ({
      url: `${SITE_URL}/listings/model/${m.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    // Listings are the money pages: one canonical slug URL each, freshest first.
    ...listings.map((l) => ({
      url: `${SITE_URL}${listingPath(l)}`,
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
