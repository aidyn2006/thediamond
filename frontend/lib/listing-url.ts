import { brandLabels, type PhoneBrand } from "@/lib/phones";

/**
 * Listing URLs. Every listing lives at `/listings/<id>-<brand-model-storage>` so the
 * URL itself carries the search terms people type ("iphone 13 mini 256gb"), while the
 * numeric prefix keeps lookups trivial and old links working.
 *
 * The id stays the source of truth: `parseListingId` ignores the slug, the page
 * redirects any other spelling of the same id to the canonical path, and the sitemap
 * emits only that path.
 */

/** Cyrillic → latin so a model typed in Russian/Kazakh still produces an ASCII slug. */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "q", ң: "ng", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

/** Max slug length — long enough for "apple-iphone-15-pro-max-1024gb", short enough to read. */
const MAX_SLUG = 60;

export function slugify(input: string): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("");
  const slug = latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= MAX_SLUG) return slug;
  // Cut on a word boundary so the slug never ends mid-word.
  const cut = slug.slice(0, MAX_SLUG);
  return cut.slice(0, cut.lastIndexOf("-") > 0 ? cut.lastIndexOf("-") : MAX_SLUG);
}

/** Shape shared by ListingSummary / PublicListing / ListingDetail. */
export interface ListingUrlParts {
  id: number;
  brand: PhoneBrand;
  model: string;
  storageGb?: number | null;
}

export function listingSlug(l: ListingUrlParts): string {
  return slugify(
    `${brandLabels[l.brand]} ${l.model} ${l.storageGb ? `${l.storageGb}gb` : ""}`,
  );
}

/** Canonical path of a listing. */
export function listingPath(l: ListingUrlParts): string {
  const slug = listingSlug(l);
  return slug ? `/listings/${l.id}-${slug}` : `/listings/${l.id}`;
}

/** The `[id]` route param → numeric id, or null when it isn't a listing URL at all. */
export function parseListingId(param: string): string | null {
  const m = /^(\d+)(?:-.*)?$/.exec(decodeURIComponent(param));
  return m ? m[1] : null;
}
