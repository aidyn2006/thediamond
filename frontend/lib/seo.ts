import type { Metadata } from "next";
import type { ListingSummary } from "@/lib/api-types";

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
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  // og/twitter titles are set explicitly (Next doesn't back-fill them once a page
  // supplies its own `openGraph` object). `title` is omitted entirely when absent
  // so the root layout's `title.default` still applies to the <title> tag.
  const ogTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE,
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-KZ",
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
}: {
  name: string;
  description: string;
  path: string;
  listings: ListingSummary[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "ru-KZ",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 50).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/listings/${l.id}`),
        name: l.title,
      })),
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
