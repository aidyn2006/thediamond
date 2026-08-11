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

      <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4 xl:grid-cols-6">
        {listings.map((l) => (
          <div key={l.id} className="w-[168px] shrink-0 snap-start md:w-auto">
            <ListingCard listing={l} heart={heart} />
          </div>
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
