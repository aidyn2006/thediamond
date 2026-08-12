import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { CityChips } from "@/components/listing/CityChips";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { JsonLd } from "@/components/JsonLd";
import { buttonClasses } from "@/components/ui/Button";
import { getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { breadcrumbJsonLd, faqPageJsonLd, pageMetadata } from "@/lib/seo";
import { formatTenge } from "@/lib/phones";
import { brandPath } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Обменять айфон на другую модель — как это сделать в Казахстане",
  description:
    "Trade-in в Казахстане отдаёт телефон магазину дешевле рынка. Как обменять айфон на другую модель напрямую: продать свой владельцу и купить нужный в том же городе, без комиссии и доплат посреднику.",
  path: "/exchange",
});

const STEPS: [string, string][] = [
  [
    "Оцените свой телефон по живым объявлениям",
    "Откройте каталог своей модели и посмотрите реальные цены. Это ваш «зачёт» — и он почти всегда выше, чем предлагает trade-in в магазине.",
  ],
  [
    "Выставьте свой аппарат на продажу",
    "Фото, память, ёмкость аккумулятора, город. Объявление проходит модерацию и попадает в каталог и городские подборки.",
  ],
  [
    "Параллельно выберите новый",
    "Добавьте подходящие варианты в избранное и договоритесь о встрече на тот же день, когда продаёте свой — так вы не останетесь без телефона.",
  ],
  [
    "Проведите обе встречи и доплатите разницу",
    "Вы получаете деньги от своего покупателя и сразу оплачиваете новый телефон. Разница — только между ценами аппаратов, без процента посреднику.",
  ],
];

export default async function ExchangePage() {
  const session = await auth();
  const listings = await getPublicListings();
  const apple = listings.filter((l) => l.brand === "APPLE");
  const appleFrom = apple.length ? Math.min(...apple.map((l) => l.price)) : null;

  const qa = [
    {
      q: "Есть ли на TheDiamond официальный trade-in?",
      a: "Нет, и это осознанно. Trade-in — это выкуп телефона магазином со скидкой к рыночной цене, чтобы магазин заработал на перепродаже. Здесь вы продаёте свой телефон напрямую другому человеку по рыночной цене и сами покупаете нужный, поэтому разницу доплачиваете меньше.",
    },
    {
      q: "Как обменять айфон на другую модель, если нужно быстро?",
      a: "Поставьте свою цену по нижней границе рынка и договоритесь о двух встречах в один день: сначала продажа, затем покупка. В крупных городах это реально уложить в сутки — объявлений там больше всего.",
    },
    {
      q: "Можно ли обменяться телефонами напрямую с другим пользователем?",
      a: "Договориться об этом между собой вам никто не мешает, но сайт такую сделку не оформляет: заявки и статусы рассчитаны на покупку. Практичнее провести две обычные сделки — так каждая сторона видит живые деньги и понятную цену.",
    },
    {
      q: "Что проверить у телефона, который берёте на замену?",
      a: "IMEI, отсутствие привязки к чужому аккаунту, ёмкость аккумулятора, экран и датчики. Полный список — в нашем чек-листе проверки перед покупкой.",
    },
  ];

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} />

      <main id="main-content" className="mx-auto max-w-[900px] px-6 py-8 md:px-10">
        <h1 className="text-28 font-bold leading-tight md:text-40">
          Обменять телефон на другую модель
        </h1>
        <p className="mt-3 max-w-[640px] text-17 leading-relaxed text-text-dim">
          Схема «продал свой — купил нужный» заменяет trade-in и почти всегда выгоднее:
          магазин выкупает аппарат ниже рынка, а покупатель платит рыночную цену. Здесь обе
          сделки идут напрямую между людьми, без комиссии сайта.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={session?.user ? "/listings/new" : "/register"}
            className={buttonClasses("primary")}
          >
            Выставить свой телефон
          </Link>
          <Link href={brandPath("APPLE")} className={buttonClasses("secondary")}>
            {appleFrom != null ? `iPhone от ${formatTenge(appleFrom)}` : "Смотреть iPhone"}
          </Link>
        </div>

        <section aria-labelledby="steps" className="mt-12">
          <h2 id="steps" className="mb-4 text-22 font-bold md:text-28">
            Как обменять за один день
          </h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-card border border-border bg-surface p-5">
                <span className="text-13 font-semibold text-accent">Шаг {i + 1}</span>
                <p className="mt-1 text-17 font-semibold">{title}</p>
                <p className="mt-1 text-15 leading-relaxed text-text-dim">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cities" className="mt-12">
          <h2 id="cities" className="mb-2 text-22 font-bold md:text-28">
            Обмен по городам
          </h2>
          <p className="mb-4 text-15 text-text-dim">
            Обе сделки удобнее проводить в одном городе — выберите свой.
          </p>
          <CityChips />
        </section>

        <FaqBlock qa={qa} title="Вопросы об обмене" />

        <p className="mt-8 text-15 text-text-dim">
          Перед покупкой на замену пройдите{" "}
          <Link
            href="/guides/kak-proverit-telefon-pered-pokupkoy"
            className="text-accent underline underline-offset-2"
          >
            чек-лист проверки телефона
          </Link>
          .
        </p>
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Обмен телефона", path: "/exchange" }]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
