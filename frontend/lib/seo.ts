import type { Metadata } from "next";
import type { ListingSummary } from "@/lib/api-types";
import { listingPath } from "@/lib/listing-url";
import { DEFAULT_LOCALE, LOCALE_META, languageAlternates, type Locale } from "@/lib/routes";
import {
  brandLabels,
  conditionLabels,
  storageLabel,
  type PhoneBrand,
  type PhoneCondition,
} from "@/lib/phones";

/**
 * Single source of truth for site-wide SEO. Pages compose their metadata with
 * `pageMetadata()` and emit structured data with the `*JsonLd` builders (rendered
 * through <JsonLd/>). OG/Twitter images come from the file-based `opengraph-image`
 * routes — Next attaches them automatically, so we never hardcode image URLs here.
 */

export const SITE_URL = "https://thediamond.kz";
export const SITE_NAME = "TheDiamond";
export const DEFAULT_TITLE = "TheDiamond — телефоны от людей, а не от перекупов";
export const DEFAULT_DESCRIPTION =
  "Маркетплейс телефонов в Казахстане: покупайте у частных продавцов и продавайте свой телефон без комиссии. Каждое объявление проходит проверку модератора.";
export const OG_LOCALE = "ru_RU";
export const CONTACT_EMAIL = "hello@thediamond.kz";

/** Relative path → absolute URL on the production origin (passes full URLs through). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolutise an image src (e.g. a backend `/uploads/…` avatar) for OG / JSON-LD. */
export function absoluteImage(src?: string | null): string | undefined {
  if (!src) return undefined;
  return absoluteUrl(src);
}

type PageMetaInput = {
  /** Page title WITHOUT the site suffix — the root layout applies the template. */
  title?: string;
  description?: string;
  /** Canonical path, e.g. "/" or "/u/12". */
  path?: string;
  /** Set false to keep the page out of the index (thin/auth pages). */
  index?: boolean;
  ogType?: "website" | "profile" | "article";
  /**
   * Same page in the other locales, as a locale → path builder. Pass the matching
   * lib/routes builder and hreflang is emitted automatically once a second locale goes
   * live; until then `languageAlternates()` returns undefined and nothing is written.
   */
  altPaths?: (locale: Locale) => string;
  /** Language this page is written in — drives og:locale. */
  locale?: Locale;
};

/**
 * Builds a page `Metadata` object with canonical, Open Graph and Twitter wired
 * consistently. og/twitter titles intentionally inherit the resolved page title
 * (Next fills them from `title` + the layout template).
 */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  index = true,
  ogType = "website",
  altPaths,
  locale = DEFAULT_LOCALE,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const languages = altPaths
    ? languageAlternates((l) => absoluteUrl(altPaths(l)))
    : undefined;
  // og/twitter titles are set explicitly (Next doesn't back-fill them once a page
  // supplies its own `openGraph` object). `title` is omitted entirely when absent
  // so the root layout's `title.default` still applies to the <title> tag.
  const ogTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: LOCALE_META[locale].ogLocale,
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                    */
/* ------------------------------------------------------------------ */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon-512.png"),
    description: DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    areaServed: { "@type": "Country", name: "Kazakhstan" },
  };
}

/**
 * WebSite + SearchAction. The `potentialAction` is what lets Google render a search box
 * inside our sitelinks — it has to point at a real, crawlable query URL, which is why
 * the target is the catalog's own `q` parameter rather than an internal API route.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-KZ",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/listings?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Seller profile as a Person, with the rating attached only when there are real reviews.
 * An AggregateRating with `reviewCount: 0` (or an invented value) is a structured-data
 * violation, so callers pass null until the seller has actually been rated.
 */
export function sellerJsonLd({
  id,
  name,
  city,
  memberSince,
  image,
  rating,
}: {
  id: number | string;
  name: string;
  city?: string | null;
  memberSince?: string | null;
  image?: string | null;
  rating?: { value: number; count: number } | null;
}) {
  const url = absoluteUrl(`/u/${id}`);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(image ? { image: absoluteImage(image) } : {}),
    ...(city
      ? { address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "KZ" } }
      : {}),
    ...(memberSince ? { memberOf: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } : {}),
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.value,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/** BreadcrumbList from an ordered list of {name, path} crumbs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/**
 * CollectionPage wrapping an ItemList of listings (catalog + brand hubs). Each row
 * carries its price so Google can show the range without crawling every listing.
 */
export function catalogJsonLd({
  name,
  description,
  path,
  listings,
  locale = DEFAULT_LOCALE,
}: {
  name: string;
  description: string;
  path: string;
  listings: ListingSummary[];
  locale?: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: LOCALE_META[locale].hreflang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 50).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(listingPath(l)),
        name: l.title,
      })),
    },
  };
}

/* ------------------------------------------------------------------ */
/* One listing = one indexable product page                            */
/* ------------------------------------------------------------------ */

/** schema.org condition per our five states — "на запчасти" is damaged, not just used. */
const CONDITION_SCHEMA: Record<PhoneCondition, string> = {
  NEW: "https://schema.org/NewCondition",
  LIKE_NEW: "https://schema.org/UsedCondition",
  GOOD: "https://schema.org/UsedCondition",
  FAIR: "https://schema.org/UsedCondition",
  FOR_PARTS: "https://schema.org/DamagedCondition",
};

export interface ListingSeoInput {
  id: number;
  title: string;
  brand: PhoneBrand;
  model: string;
  storageGb?: number | null;
  ramGb?: number | null;
  color?: string | null;
  condition: PhoneCondition;
  batteryHealth?: number | null;
  price: number;
  city: string;
  description: string;
  images: string[];
  sellerName: string;
  /** ACTIVE / SOLD / … — decides Offer availability. */
  status?: string | null;
}

/**
 * Meta description for one listing: the facts a searcher scans for (price, city,
 * memory, condition) first, then the seller's own words. Google truncates ~160
 * characters but indexes the whole tag, so we allow a bit more.
 */
export function listingDescription(l: ListingSeoInput): string {
  const facts = [
    l.storageGb ? storageLabel(l.storageGb) : null,
    conditionLabels[l.condition],
    l.batteryHealth ? `АКБ ${l.batteryHealth}%` : null,
    l.city,
  ]
    .filter(Boolean)
    .join(", ");
  const text = `${l.title} за ${l.price.toLocaleString("ru-RU")} ₸. ${facts}. ${l.description}`
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 300 ? `${text.slice(0, 297).trimEnd()}…` : text;
}

/**
 * Product + Offer for a single listing — this is what earns the price/condition
 * snippet in search results. `additionalProperty` carries the specs Google shows in
 * the merchant-style snippet for used goods.
 */
export function listingJsonLd(l: ListingSeoInput) {
  const url = absoluteUrl(listingPath(l));
  const specs = [
    l.storageGb ? { name: "Память", value: storageLabel(l.storageGb) } : null,
    l.ramGb ? { name: "ОЗУ", value: `${l.ramGb} ГБ` } : null,
    l.color ? { name: "Цвет", value: l.color } : null,
    l.batteryHealth ? { name: "Аккумулятор", value: `${l.batteryHealth} %` } : null,
  ].filter((x): x is { name: string; value: string } => x != null);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.title,
    description: l.description,
    sku: `listing-${l.id}`,
    url,
    brand: { "@type": "Brand", name: brandLabels[l.brand] },
    model: l.model,
    image: l.images.map((src) => absoluteImage(src)).filter(Boolean),
    additionalProperty: specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.name,
      value: s.value,
    })),
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: "KZT",
      itemCondition: CONDITION_SCHEMA[l.condition],
      availability:
        l.status === "SOLD"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url,
      availableAtOrFrom: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: l.city,
          addressCountry: "KZ",
        },
      },
      seller: { "@type": "Person", name: l.sellerName },
    },
  };
}

/** Article for the guides. Author is the site itself — these aren't personal posts. */
export function articleJsonLd({
  headline,
  description,
  path,
  published,
  modified,
}: {
  headline: string;
  description: string;
  path: string;
  published: string;
  modified?: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: "ru-KZ",
    datePublished: published,
    dateModified: modified ?? published,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") },
    },
  };
}

/** FAQPage from a list of {q, a} pairs. */
export function faqPageJsonLd(qa: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
