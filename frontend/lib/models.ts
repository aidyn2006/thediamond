import { slugify } from "@/lib/listing-url";
import { brandLabels, type PhoneBrand } from "@/lib/phones";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Model hubs are built from live data, not a hardcoded list: whatever people actually
 * sell ("iPhone 13", "Redmi Note 12") becomes a page at /listings/model/<slug>. That
 * keeps the long tail ("айфон 13 бу купить") covered without ever publishing an empty
 * page for a model nobody has.
 */

export interface ModelHub {
  slug: string;
  /** "Apple iPhone 13" — brand label + model as the seller typed it. */
  label: string;
  brand: PhoneBrand;
  model: string;
  listings: ListingSummary[];
  minPrice: number;
  cities: string[];
}

/**
 * Cyrillic spellings people actually type. Used in the copy so a page targeting
 * "айфон 13 бу" contains that phrase instead of only the latin one.
 */
const RU_BRAND_ALIAS: Partial<Record<PhoneBrand, string>> = {
  APPLE: "Айфон",
  SAMSUNG: "Самсунг",
  XIAOMI: "Сяоми",
  HUAWEI: "Хуавей",
  HONOR: "Хонор",
  REALME: "Реалми",
};

export function modelSlugOf(l: { brand: PhoneBrand; model: string }): string {
  return slugify(`${brandLabels[l.brand]} ${l.model}`);
}

/** Russian alias of a model, e.g. "Айфон 13" for "Apple iPhone 13". Null when we have none. */
export function modelRuAlias(brand: PhoneBrand, model: string): string | null {
  const alias = RU_BRAND_ALIAS[brand];
  if (!alias) return null;
  // "iPhone 13" → "13": the model usually repeats the brand, drop it before joining.
  const tail = model.replace(new RegExp(brandLabels[brand], "i"), "").trim();
  const cleaned = tail.replace(/^iphone\s*/i, "").trim();
  return `${alias} ${cleaned || model}`.replace(/\s+/g, " ").trim();
}

/** Groups active listings into model hubs, biggest first. */
export function groupByModel(listings: ListingSummary[]): ModelHub[] {
  const byslug = new Map<string, ModelHub>();
  for (const l of listings) {
    const slug = modelSlugOf(l);
    if (!slug) continue;
    const hub = byslug.get(slug);
    if (hub) {
      hub.listings.push(l);
      hub.minPrice = Math.min(hub.minPrice, l.price);
      if (!hub.cities.includes(l.city)) hub.cities.push(l.city);
    } else {
      byslug.set(slug, {
        slug,
        label: `${brandLabels[l.brand]} ${l.model}`,
        brand: l.brand,
        model: l.model,
        listings: [l],
        minPrice: l.price,
        cities: [l.city],
      });
    }
  }
  return [...byslug.values()].sort((a, b) => b.listings.length - a.listings.length);
}

export function findModelHub(listings: ListingSummary[], slug: string): ModelHub | null {
  return groupByModel(listings).find((h) => h.slug === slug) ?? null;
}
