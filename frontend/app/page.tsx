import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BrandChips } from "@/components/listing/BrandChips";
import { ListingSection } from "@/components/listing/ListingSection";
import { buttonClasses } from "@/components/ui/Button";
import { getPublicListings } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { formatTenge } from "@/lib/phones";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Телефоны от людей, а не от перекупов",
  description:
    "Маркетплейс телефонов в Казахстане: покупайте у частных продавцов и продавайте свой телефон без комиссии. Каждое объявление проходит проверку.",
  path: "/",
});

/** A row of four is the smallest set that reads as a section rather than leftovers. */
const MIN_SECTION = 4;
const CHEAP_UNDER = 100_000;

export default async function HomePage() {
  const session = await auth();
  // Signed-in members have no use for the marketing page.
  if (session?.user) redirect(roleHome(session.user.role));

  // One cached catalog call feeds every row — the backend already returns newest
  // first, so the sections are just different slices of it.
  const all = await getPublicListings();
  const newest = all.slice(0, 12);
  const popular = [...all]
    .filter((l) => l.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);
  const cheap = all.filter((l) => l.price <= CHEAP_UNDER).slice(0, 12);

  return (
    <>
      <PublicHeader />
      <CategoryBar />

      <main id="main-content">
        {/* Dark band + white sheet: the phones start high on the page and the pitch
            rides along in the banner instead of owning a full screen. */}
        <div className="bg-text pb-14 pt-4">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10">
            <section className="rounded-card bg-prism px-6 py-10 md:px-12 md:py-14">
              <h1 className="max-w-[640px] text-28 font-bold leading-tight text-text md:text-40">
                Телефоны от людей, а не от перекупов
              </h1>
              <p className="mt-3 max-w-[520px] text-15 text-text/80 md:text-17">
                Каждое объявление проходит проверку модератора. Никакой комиссии:
                договариваетесь напрямую с продавцом и платите при встрече.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/listings" className={buttonClasses("secondary")}>
                  Смотреть телефоны
                </Link>
                <Link href="/register" className={buttonClasses("ghost")}>
                  Продать свой
                </Link>
              </div>
            </section>
          </div>
        </div>

        <div className="-mt-8 rounded-t-[32px] bg-surface pb-16 pt-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 md:px-10">
            <BrandChips />

            <ListingSection
              title="Новое поступление"
              href="/listings"
              listings={newest}
              seeAll="Весь каталог"
            />

            {popular.length >= MIN_SECTION && (
              <ListingSection
                title="Самые просматриваемые"
                href="/listings"
                listings={popular}
              />
            )}

            {cheap.length >= MIN_SECTION && (
              <ListingSection
                title={`До ${formatTenge(CHEAP_UNDER)}`}
                href={`/listings?maxPrice=${CHEAP_UNDER}`}
                listings={cheap}
              />
            )}

            <section aria-labelledby="how" id="how" className="scroll-mt-8">
              <h2 id="how" className="mb-6 text-22 font-bold md:text-28">
                Как это работает
              </h2>
              <ol className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Находите телефон", "Бренд, память, состояние и город — в фильтрах каталога."],
                  ["Отправляете заявку", "Продавец принимает её и открывает вам свой номер."],
                  ["Встречаетесь", "Проверяете телефон и платите на месте — без комиссии сайта."],
                ].map(([title, text], i) => (
                  <li key={title} className="rounded-card border border-border bg-bg p-5">
                    <span className="text-13 text-accent">Шаг {i + 1}</span>
                    <p className="mt-2 text-15 font-semibold">{title}</p>
                    <p className="mt-1 text-13 text-text-dim">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
