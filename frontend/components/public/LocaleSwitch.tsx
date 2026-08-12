import Link from "next/link";
import { ui } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_META, homePath, type Locale } from "@/lib/routes";

/**
 * Language switch.
 *
 * `href` is the SAME page in the other language, built by the caller from lib/routes —
 * a switch that always dumps you on the home page is the classic way to make hreflang
 * pairs disagree with the site's own navigation. Pages that have no counterpart yet
 * (guides, the member area) simply don't render it.
 *
 * `hrefLang` tells crawlers what they'd get, and `rel="alternate"` matches the hreflang
 * we emit in the metadata, so the two never contradict each other.
 */
export function LocaleSwitch({
  locale = DEFAULT_LOCALE,
  href,
}: {
  locale?: Locale;
  href?: string;
}) {
  const other: Locale = locale === "ru" ? "kk" : "ru";
  const target = href ?? homePath(other);

  return (
    <Link
      href={target}
      hrefLang={LOCALE_META[other].hreflang}
      rel="alternate"
      lang={LOCALE_META[other].htmlLang}
      className="rounded-pill border border-border px-3 py-1.5 text-13 font-semibold text-text-dim transition-colors duration-150 hover:border-accent hover:text-text"
    >
      {ui(other).langLabel}
    </Link>
  );
}
