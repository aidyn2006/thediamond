import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/Button";
import { getPublicListings } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { PHONE_BRANDS, brandLabels, brandSlugs } from "@/lib/phones";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Телефоны от людей, а не от перекупов",
  description:
    "Маркетплейс телефонов в Казахстане: покупайте у частных продавцов и продавайте свой телефон без комиссии. Каждое объявление проходит проверку.",
  path: "/",
});

/** Brands worth surfacing on the landing page as entry points into the catalog. */
const FEATURED_BRANDS = PHONE_BRANDS.slice(0, 6);

export default async function HomePage() {
  const session = await auth();
  // Signed-in members have no use for the marketing page.
  if (session?.user) redirect(roleHome(session.user.role));

  const latest = (await getPublicListings()).slice(0, 8);

  return (
    <>
      <PublicHeader />

      <main id="main-content">
        <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <h1 className="max-w-[720px] text-40 font-semibold leading-tight md:text-56">
            Телефоны от людей, а не от перекупов
          </h1>
          <p className="mt-4 max-w-[560px] text-18 text-text-dim">
            Каждое объявление проходит проверку модератора. Никакой комиссии: договариваетесь
            напрямую с продавцом и платите при встрече.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/listings">
              <Button variant="primary">Смотреть телефоны</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Продать свой</Button>
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="brands"
          className="mx-auto max-w-[1200px] px-6 pb-12 md:px-10"
        >
          <h2 id="brands" className="mb-4 text-18 font-semibold">
            Популярные бренды
          </h2>
          <div className="flex flex-wrap gap-2">
            {FEATURED_BRANDS.map((b) => (
              <Link
                key={b}
                href={`/listings/brand/${brandSlugs[b]}`}
                className="rounded-btn border border-border px-4 py-2 text-15 text-text-dim transition-colors duration-150 hover:border-accent hover:text-text"
              >
                {brandLabels[b]}
              </Link>
            ))}
          </div>
        </section>

        {latest.length > 0 && (
          <section
            aria-labelledby="latest"
            className="mx-auto max-w-[1200px] px-6 pb-16 md:px-10"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="latest" className="text-18 font-semibold">
                Свежие объявления
              </h2>
              <Link href="/listings" className="text-15 text-accent underline underline-offset-2">
                Весь каталог
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}

        <section
          aria-labelledby="how"
          className="mx-auto max-w-[1200px] px-6 pb-24 md:px-10"
        >
          <h2 id="how" className="mb-6 text-18 font-semibold">
            Как это работает
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["Находите телефон", "Фильтры по бренду, памяти, состоянию и городу."],
              ["Отправляете заявку", "Продавец принимает её и открывает вам свой номер."],
              ["Встречаетесь", "Проверяете телефон и платите на месте — без комиссии сайта."],
            ].map(([title, text], i) => (
              <li key={title} className="rounded-card border border-border bg-surface p-5">
                <span className="text-13 text-accent">Шаг {i + 1}</span>
                <p className="mt-2 text-15 font-semibold">{title}</p>
                <p className="mt-1 text-13 text-text-dim">{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
