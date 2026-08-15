import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LocaleSwitch } from "@/components/public/LocaleSwitch";
import { buttonClasses } from "@/components/ui/Button";
import { ui } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/routes";

/**
 * Shared header for public (logged-out) pages: catalog, hubs, creator profiles.
 *
 * `altHref` is this page in the other language; pass it on every localised route so the
 * switch keeps the visitor where they were. Omit it on Russian-only pages and the switch
 * is hidden rather than pointing somewhere that doesn't exist.
 */
export function PublicHeader({
  maxWidth = "1200px",
  locale = DEFAULT_LOCALE,
  altHref,
}: {
  maxWidth?: string;
  locale?: Locale;
  altHref?: string;
}) {
  const t = ui(locale);

  return (
    <header className="border-b border-border">
      {/* Logo + language switch + two CTAs need ~400px at full size; a 360px phone
          offers 312. Everything in this row shrinks a step below `sm` instead of
          overflowing, which used to scroll the whole page sideways. */}
      <div
        className="mx-auto flex h-14 items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 md:px-10"
        style={{ maxWidth }}
      >
        <Logo compact />
        <nav aria-label={t.header.nav} className="flex shrink-0 items-center gap-2 sm:gap-3">
          {altHref && <LocaleSwitch locale={locale} href={altHref} />}
          <Link href="/login" className={buttonClasses("ghost", false, "sm")}>
            {t.header.login}
          </Link>
          <Link href="/register" className={buttonClasses("primary", false, "sm")}>
            {t.header.register}
          </Link>
        </nav>
      </div>
    </header>
  );
}
