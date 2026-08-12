import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CityHub, cityHubMetadata } from "@/components/hubs/CityHub";
import { BrandHub, brandHubMetadata } from "@/components/hubs/BrandHub";
import { BrandCityHub, brandCityHubMetadata } from "@/components/hubs/BrandCityHub";
import { ModelHub, modelHubMetadata } from "@/components/hubs/ModelHub";
import { getPublicListings } from "@/lib/api";
import { findModelHub } from "@/lib/models";
import { RESERVED_ROOT_SEGMENTS, resolveFlatSlug, type FlatSlug, type Locale } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/**
 * Shared body of the flat-slug routes. Both `app/[slug]` (Russian) and `app/kk/[slug]`
 * are three-line files that delegate here, so the two locales can never drift apart in
 * which slugs they accept.
 */

/** Resolves the slug, including the data-dependent model case. Null → 404. */
async function resolve(slug: string, locale: Locale): Promise<FlatSlug | null> {
  if (RESERVED_ROOT_SEGMENTS.has(slug)) return null;
  const hit = resolveFlatSlug(slug, locale);
  if (!hit || hit.kind !== "model") return hit;
  // A model hub exists only while somebody sells it — validate against live listings.
  return findModelHub(await getPublicListings(), hit.slug) ? hit : null;
}

export async function hubMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const hit = await resolve(slug, locale);
  if (!hit) return pageMetadata({ title: "404", index: false, locale });

  switch (hit.kind) {
    case "city":
      return cityHubMetadata(hit.city, locale);
    case "brand":
      return brandHubMetadata(hit.brand, locale);
    case "brandCity":
      return brandCityHubMetadata(hit.brand, hit.city, locale);
    case "model": {
      const hub = findModelHub(await getPublicListings(), hit.slug);
      return hub ? modelHubMetadata(hub, locale) : pageMetadata({ title: "404", index: false, locale });
    }
  }
}

export async function HubDispatch({ slug, locale }: { slug: string; locale: Locale }) {
  const hit = await resolve(slug, locale);
  if (!hit) notFound();

  switch (hit.kind) {
    case "city":
      return <CityHub city={hit.city} locale={locale} />;
    case "brand":
      return <BrandHub brand={hit.brand} locale={locale} />;
    case "brandCity":
      return <BrandCityHub brand={hit.brand} city={hit.city} locale={locale} />;
    case "model": {
      const hub = findModelHub(await getPublicListings(), hit.slug);
      if (!hub) notFound();
      return <ModelHub hub={hub} locale={locale} />;
    }
  }
}
