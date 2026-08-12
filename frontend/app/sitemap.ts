import type { MetadataRoute } from "next";
import { getPublicListings, getPublicSellers } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import { listingPath } from "@/lib/listing-url";
import { groupByModel } from "@/lib/models";
import { GUIDES } from "@/lib/guides";
import {
  CITY_HUBS,
  PHONE_BRANDS,
  brandCityPath,
  brandPath,
  catalogPath,
  cityPath,
  exchangePath,
  guidePath,
  guidesPath,
  homePath,
  modelPath,
  sellPath,
  sellerPath,
} from "@/lib/routes";

// Re-generate at most hourly; new approved listings appear without a redeploy.
export const revalidate = 3600;

/**
 * Built entirely from lib/routes.ts — every URL here comes from the same builders the
 * links use, so a hub can never be reachable but unlisted (or listed but 404).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, sellers] = await Promise.all([
    getPublicListings(),
    getPublicSellers(),
  ]);
  const now = new Date();
  const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

  // Geo and model pages are only worth submitting when they have something on them —
  // an empty hub is a thin page, and thin pages drag the whole site's crawl budget.
  const citiesWithStock = new Set(listings.map((l) => l.city));
  const brandCityPairs = new Set(listings.map((l) => `${l.brand}|${l.city}`));
  const models = groupByModel(listings);

  return [
    { url: abs(homePath()), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: abs(catalogPath()), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: abs(sellPath()), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: abs(exchangePath()), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: abs(guidesPath()), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...GUIDES.map((g) => ({
      url: abs(guidePath(g.slug)),
      lastModified: new Date(g.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...PHONE_BRANDS.map((b) => ({
      url: abs(brandPath(b)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // City hubs: every city stays listed (they're the geo landing pages), but the ones
    // with stock get a higher priority.
    ...CITY_HUBS.map((c) => ({
      url: abs(cityPath(c)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: citiesWithStock.has(c.name) ? 0.8 : 0.4,
    })),
    // Brand × city only where such a listing actually exists.
    ...CITY_HUBS.flatMap((c) =>
      PHONE_BRANDS.filter((b) => brandCityPairs.has(`${b}|${c.name}`)).map((b) => ({
        url: abs(brandCityPath(b, c)),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ),
    ...models.map((m) => ({
      url: abs(modelPath(m.slug)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    // Listings are the money pages: one canonical slug URL each, freshest first.
    ...listings.map((l) => ({
      url: abs(listingPath(l)),
      lastModified: l.createdAt ? new Date(l.createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...sellers.map((s) => ({
      url: abs(sellerPath(s.id)),
      lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
