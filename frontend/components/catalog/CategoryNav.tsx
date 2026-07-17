import Link from "next/link";
import { cn } from "@/lib/cn";
import { CATEGORIES, categoryLabels, categorySlugs } from "@/lib/categories";
import type { Category } from "@/lib/categories";

const chip =
  "rounded-pill border px-3.5 py-2 text-13 font-medium transition-colors duration-150";
const chipActive = "border-accent text-text";
const chipIdle = "border-border text-text-dim hover:border-text-dim hover:text-text";

/** Crawlable category strip (real <a> links, not a client filter) — the internal
 *  linking that lets search engines reach every /catalog/[category] hub. */
export function CategoryNav({ active }: { active?: Category }) {
  return (
    <nav aria-label="Категории креаторов" className="flex flex-wrap gap-2">
      <Link
        href="/catalog"
        aria-current={active ? undefined : "page"}
        className={cn(chip, active ? chipIdle : chipActive)}
      >
        Все
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c}
          href={`/catalog/${categorySlugs[c]}`}
          aria-current={active === c ? "page" : undefined}
          className={cn(chip, active === c ? chipActive : chipIdle)}
        >
          {categoryLabels[c]}
        </Link>
      ))}
    </nav>
  );
}
