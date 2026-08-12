import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CityHub, cityHubMetadata } from "@/components/hubs/CityHub";
import { BrandHub, brandHubMetadata } from "@/components/hubs/BrandHub";
import { BrandCityHub, brandCityHubMetadata } from "@/components/hubs/BrandCityHub";
import { ModelHub, modelHubMetadata } from "@/components/hubs/ModelHub";
import { getPublicListings } from "@/lib/api";
import { findModelHub } from "@/lib/models";
import { RESERVED_ROOT_SEGMENTS, resolveFlatSlug, type FlatSlug } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/**
 * Every SEO hub lives at the root under a keyword slug — `/telefony-almaty`,
 * `/kupit-iphone`, `/kupit-iphone-almaty`, `/apple-iphone-13`. Next only matches whole
 * segments, so one catch-all resolves the slug and hands off to the right hub.
 *
 * Static routes (`/listings`, `/sell`, `/login`, …) take precedence over this file, and
 * RESERVED_ROOT_SEGMENTS keeps a hub slug from ever shadowing one of them.
 */

/** Resolves the slug, including the data-dependent model case. Null → 404. */
async function resolve(slug: string): Promise<FlatSlug | null> {
  if (RESERVED_ROOT_SEGMENTS.has(slug)) return null;
  const hit = resolveFlatSlug(slug);
  if (!hit || hit.kind !== "model") return hit;
  // A model hub exists only while somebody sells it — validate against live listings.
  return findModelHub(await getPublicListings(), hit.slug) ? hit : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hit = await resolve(slug);
  if (!hit) return pageMetadata({ title: "Страница не найдена", index: false });

  switch (hit.kind) {
    case "city":
      return cityHubMetadata(hit.city);
    case "brand":
      return brandHubMetadata(hit.brand);
    case "brandCity":
      return brandCityHubMetadata(hit.brand, hit.city);
    case "model": {
      const hub = findModelHub(await getPublicListings(), hit.slug);
      return hub ? modelHubMetadata(hub) : pageMetadata({ title: "Модель не найдена", index: false });
    }
  }
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hit = await resolve(slug);
  if (!hit) notFound();

  switch (hit.kind) {
    case "city":
      return <CityHub city={hit.city} />;
    case "brand":
      return <BrandHub brand={hit.brand} />;
    case "brandCity":
      return <BrandCityHub brand={hit.brand} city={hit.city} />;
    case "model": {
      const hub = findModelHub(await getPublicListings(), hit.slug);
      if (!hub) notFound();
      return <ModelHub hub={hub} />;
    }
  }
}
