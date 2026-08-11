import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { DealRow } from "@/components/deal/DealRow";
import { Button } from "@/components/ui/Button";
import { requireSignedIn } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import type { DealItem } from "@/lib/api-types";

export const metadata = pageMetadata({
  title: "Сделки",
  path: "/deals",
  index: false,
});

async function fetchDeals(path: string): Promise<DealItem[]> {
  const res = await apiFetch(path);
  return res.ok ? ((await res.json()) as DealItem[]) : [];
}

export default async function DealsPage() {
  const me = await requireSignedIn();
  const [sales, purchases] = await Promise.all([
    fetchDeals("/api/deals/sales"),
    fetchDeals("/api/deals/purchases"),
  ]);

  const waiting = sales.filter((d) => d.status === "REQUESTED").length;

  return (
    <>
      <AppHeader email={me.email} items={memberNav} />
      <main id="main-content" className="mx-auto max-w-[900px] px-6 py-8 md:px-10">
        <h1 className="mb-2 text-28 font-semibold">Сделки</h1>
        <p className="mb-8 text-13 text-text-dim">
          Оплата проходит вне сайта. Мы только соединяем покупателя и продавца.
        </p>

        <section className="mb-10" aria-labelledby="sales">
          <h2 id="sales" className="mb-4 text-18 font-semibold">
            Заявки на мои телефоны
            {waiting > 0 && (
              <span className="ml-2 text-13 font-normal text-warning">
                {waiting} ждут ответа
              </span>
            )}
          </h2>
          {sales.length === 0 ? (
            <p className="rounded-card border border-border bg-surface p-6 text-13 text-text-dim">
              Заявок пока нет. Они появятся, когда кто-то захочет купить ваш телефон.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {sales.map((d) => (
                <DealRow key={d.id} deal={d} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="purchases">
          <h2 id="purchases" className="mb-4 text-18 font-semibold">
            Мои покупки
          </h2>
          {purchases.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-6 text-center">
              <p className="text-13 text-text-dim">
                Вы ещё не отправляли заявок на покупку.
              </p>
              <Link href="/listings" className="mt-3 inline-block">
                <Button variant="secondary">Посмотреть каталог</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {purchases.map((d) => (
                <DealRow key={d.id} deal={d} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
