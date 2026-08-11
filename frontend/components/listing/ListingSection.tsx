import Link from "next/link";
import { ListingCard } from "./ListingCard";
import { buttonClasses } from "@/components/ui/Button";
import type { ListingSummary } from "@/lib/api-types";

/**
 * One titled row of the catalog ("Новое поступление", "Самые просматриваемые", …):
 * heading, a row of cards, and a centred "Смотреть все" underneath. Mobile scrolls
 * the row horizontally — a section is a teaser, not a page — while ≥md lays the same
 * cards out as a grid.
 */
export function ListingSection({
  title,
  href,
  listings,
  seeAll = "Смотреть все",
  heart = false,
}: {
  title: string;
  /** Where the heading link and the button go — usually a pre-filtered catalog URL. */
  href: string;
  listings: ListingSummary[];
  seeAll?: string;
  heart?: boolean;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-22 font-bold md:text-28">{title}</h2>
        <Link
          href={href}
          className="shrink-0 text-13 font-semibold text-accent underline underline-offset-2 md:text-15"
        >
          Посмотреть все
        </Link>
      </div>

      {/* Two-up on phones, one full row of six on wide screens — same rhythm as the
          catalog grid, so a section never reads as a different component. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} heart={heart} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href={href} className={buttonClasses("secondary")}>
          {seeAll}
        </Link>
      </div>
    </section>
  );
}
