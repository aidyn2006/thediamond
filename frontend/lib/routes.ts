import { CITY_HUBS, cityBySlug, type CityInfo } from "@/lib/geo";
import { PHONE_BRANDS, type PhoneBrand } from "@/lib/phones";

/**
 * Single source of truth for every public URL on the site.
 *
 * Everything that needs to know "where does X live" — links, the sitemap, hreflang,
 * the middleware's public-path check, the legacy redirects — reads it from here. A new
 * indexable route is added once, in this file, and the sitemap picks it up for free.
 *
 * Two rules shape the URLs themselves:
 *
 *  1. Hub paths are FLAT and carry the query, not the app's internal taxonomy:
 *     `/telefony-almaty`, not `/listings/city/almaty`. The words people type belong in
 *     the URL; `listings/city` is an implementation detail nobody searches for.
 *  2. Russian is served from the root (it is `x-default` and everything already indexed
 *     lives there); other locales get a prefix. Adding a locale must never move a URL
 *     that already ranks.
 */

/* ------------------------------------------------------------------ */
/* Locales                                                             */
/* ------------------------------------------------------------------ */

export const LOCALES = ["ru", "kk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

/**
 * Locales whose pages actually exist. `kk` is described throughout this file so the
 * URL scheme is settled, but it stays out of this list until the pages ship —
 * emitting hreflang for a locale that 404s is worse than emitting none.
 */
export const ENABLED_LOCALES: readonly Locale[] = ["ru"];

export const LOCALE_META: Record<
  Locale,
  { hreflang: string; ogLocale: string; htmlLang: string; label: string }
> = {
  ru: { hreflang: "ru-KZ", ogLocale: "ru_RU", htmlLang: "ru", label: "Рус" },
  kk: { hreflang: "kk-KZ", ogLocale: "kk_KZ", htmlLang: "kk", label: "Қаз" },
};

/** Russian sits at the root; every other locale is prefixed. */
const LOCALE_PREFIX: Record<Locale, string> = { ru: "", kk: "/kk" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Strips a locale prefix: "/kk/telefony-almaty" → { locale: "kk", rest: "/telefony-almaty" }. */
export function splitLocale(pathname: string): { locale: Locale; rest: string } {
  const m = /^\/(kk)(?=\/|$)/.exec(pathname);
  if (!m) return { locale: DEFAULT_LOCALE, rest: pathname || "/" };
  return { locale: m[1] as Locale, rest: pathname.slice(m[0].length) || "/" };
}

const withLocale = (locale: Locale, path: string) =>
  `${LOCALE_PREFIX[locale]}${path}` || "/";

/* ------------------------------------------------------------------ */
/* Hub slugs                                                           */
/* ------------------------------------------------------------------ */

/**
 * Brand slug as it appears in a hub URL — the word people search, not the corporate
 * name. Apple's hub is `/kupit-iphone` because nobody types "купить Apple".
 *
 * Distinct from `brandSlugs` in lib/phones.ts, which is the OLD `/listings/brand/<slug>`
 * spelling kept alive only so the legacy redirects can resolve it.
 */
export const brandQuerySlugs: Record<PhoneBrand, string> = {
  APPLE: "iphone",
  SAMSUNG: "samsung",
  XIAOMI: "xiaomi",
  HUAWEI: "huawei",
  HONOR: "honor",
  GOOGLE: "google-pixel",
  OPPO: "oppo",
  VIVO: "vivo",
  REALME: "realme",
  ONEPLUS: "oneplus",
  TECNO: "tecno",
  INFINIX: "infinix",
  NOKIA: "nokia",
  ZTE: "zte",
  OTHER: "drugie-telefony",
};

export const brandByQuerySlug: Record<string, PhoneBrand> = Object.fromEntries(
  (Object.entries(brandQuerySlugs) as [PhoneBrand, string][]).map(([b, s]) => [s, b]),
);

/**
 * Per-locale prefixes for the flat hub slugs. Kazakh queries are typed differently
 * ("телефон сатып алу", "телефондар Алматы"), so the slug changes with the locale —
 * a Kazakh page on a Russian URL ranks for neither language.
 */
const HUB_SLUG: Record<Locale, { city: string; buy: string }> = {
  ru: { city: "telefony", buy: "kupit" },
  kk: { city: "telefondar", buy: "satyp-alu" },
};

/* ------------------------------------------------------------------ */
/* Path builders                                                       */
/* ------------------------------------------------------------------ */

export const homePath = (locale: Locale = DEFAULT_LOCALE) => withLocale(locale, "/");
export const catalogPath = (locale: Locale = DEFAULT_LOCALE) => withLocale(locale, "/listings");
export const sellPath = (locale: Locale = DEFAULT_LOCALE) => withLocale(locale, "/sell");
export const exchangePath = (locale: Locale = DEFAULT_LOCALE) => withLocale(locale, "/exchange");
export const guidesPath = (locale: Locale = DEFAULT_LOCALE) => withLocale(locale, "/guides");
export const guidePath = (slug: string, locale: Locale = DEFAULT_LOCALE) =>
  withLocale(locale, `/guides/${slug}`);
export const sellerPath = (id: number | string, locale: Locale = DEFAULT_LOCALE) =>
  withLocale(locale, `/u/${id}`);

/** `/telefony-almaty` — every phone on sale in one city. */
export function cityPath(city: CityInfo, locale: Locale = DEFAULT_LOCALE): string {
  return withLocale(locale, `/${HUB_SLUG[locale].city}-${city.slug}`);
}

/** `/kupit-iphone` — one brand, whole country. */
export function brandPath(brand: PhoneBrand, locale: Locale = DEFAULT_LOCALE): string {
  const slug = brandQuerySlugs[brand];
  return withLocale(
    locale,
    locale === "kk" ? `/${slug}-${HUB_SLUG.kk.buy}` : `/${HUB_SLUG.ru.buy}-${slug}`,
  );
}

/** `/kupit-iphone-almaty` — the shape most Kazakh queries actually take. */
export function brandCityPath(
  brand: PhoneBrand,
  city: CityInfo,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const slug = brandQuerySlugs[brand];
  return withLocale(
    locale,
    locale === "kk"
      ? `/${slug}-${city.slug}-${HUB_SLUG.kk.buy}`
      : `/${HUB_SLUG.ru.buy}-${slug}-${city.slug}`,
  );
}

/** `/apple-iphone-13` — the model slug is already keyword-shaped, so it stands alone. */
export function modelPath(slug: string, locale: Locale = DEFAULT_LOCALE): string {
  return withLocale(locale, `/${slug}`);
}

/* ------------------------------------------------------------------ */
/* Flat-slug resolution                                                */
/* ------------------------------------------------------------------ */

export type FlatSlug =
  | { kind: "city"; city: CityInfo }
  | { kind: "brand"; brand: PhoneBrand }
  | { kind: "brandCity"; brand: PhoneBrand; city: CityInfo }
  | { kind: "model"; slug: string };

/**
 * Inverse of the builders above: decides which hub a root-level slug refers to.
 *
 * Model hubs are the fallback because they are the only kind whose existence depends on
 * live data — the route resolves the slug against current listings and 404s if nobody
 * sells it. City and brand slugs are recognised by their prefix, so a model can never
 * be mistaken for one (no brand label slugifies to "telefony" or "kupit").
 */
export function resolveFlatSlug(slug: string, locale: Locale = DEFAULT_LOCALE): FlatSlug | null {
  if (!slug || slug.includes("/")) return null;
  const { city: cityWord, buy: buyWord } = HUB_SLUG[locale];

  if (slug.startsWith(`${cityWord}-`)) {
    const city = cityBySlug[slug.slice(cityWord.length + 1)];
    return city ? { kind: "city", city } : null;
  }

  // Russian puts the verb first ("kupit-iphone-almaty"), Kazakh last ("iphone-almaty-satyp-alu").
  const buyBody =
    locale === "kk"
      ? slug.endsWith(`-${buyWord}`)
        ? slug.slice(0, -(buyWord.length + 1))
        : null
      : slug.startsWith(`${buyWord}-`)
        ? slug.slice(buyWord.length + 1)
        : null;

  if (buyBody != null) {
    // Longest brand slug first so "google-pixel" wins over a hypothetical "google".
    const brands = [...PHONE_BRANDS].sort(
      (a, b) => brandQuerySlugs[b].length - brandQuerySlugs[a].length,
    );
    for (const brand of brands) {
      const bs = brandQuerySlugs[brand];
      if (buyBody === bs) return { kind: "brand", brand };
      if (buyBody.startsWith(`${bs}-`)) {
        const city = cityBySlug[buyBody.slice(bs.length + 1)];
        return city ? { kind: "brandCity", brand, city } : null;
      }
    }
    return null;
  }

  return { kind: "model", slug };
}

/* ------------------------------------------------------------------ */
/* Public surface (middleware + sitemap)                               */
/* ------------------------------------------------------------------ */

/**
 * Exact public paths and prefixes, locale-stripped. The middleware consults this before
 * bouncing anyone to /login — miss a route here and a crawler gets a login page.
 */
const PUBLIC_EXACT = new Set([
  "/",
  "/listings",
  "/sell",
  "/exchange",
  "/guides",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/opengraph-image",
]);

const PUBLIC_PREFIXES = ["/u/", "/listings/", "/guides/"];

/** Root paths that belong to the app, never to a hub slug. Guards the catch-all route. */
export const RESERVED_ROOT_SEGMENTS = new Set([
  "admin",
  "api",
  "deals",
  "favorites",
  "forgot-password",
  "guides",
  "kk",
  "listings",
  "login",
  "my-listings",
  "notifications",
  "onboarding",
  "profile",
  "register",
  "reset-password",
  "sell",
  "exchange",
  "u",
  "verify-email",
]);

/** True for anything a logged-out visitor (or a crawler) is allowed to open. */
export function isPublicPath(pathname: string): boolean {
  const { rest } = splitLocale(pathname);
  if (PUBLIC_EXACT.has(rest)) return true;
  if (PUBLIC_PREFIXES.some((p) => rest.startsWith(p))) return true;
  // Flat hub slugs live at the root, so anything that resolves to a hub is public.
  const segments = rest.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  return !RESERVED_ROOT_SEGMENTS.has(segments[0]);
}

/**
 * hreflang set for one path, expressed as a builder so callers stay locale-agnostic.
 * Returns undefined while only one locale is live — Google treats a lone self-referencing
 * hreflang as noise.
 */
export function languageAlternates(
  build: (locale: Locale) => string,
): Record<string, string> | undefined {
  if (ENABLED_LOCALES.length < 2) return undefined;
  const entries = ENABLED_LOCALES.map((l) => [LOCALE_META[l].hreflang, build(l)] as const);
  return Object.fromEntries([...entries, ["x-default", build(DEFAULT_LOCALE)]]);
}

/** Cities and brands re-exported so callers need only this module to enumerate hubs. */
export { CITY_HUBS, PHONE_BRANDS };
export type { CityInfo, PhoneBrand };
