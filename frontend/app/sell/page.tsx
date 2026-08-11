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
import { groupByModel } from "@/lib/models";
import { formatTenge } from "@/lib/phones";

export const metadata = pageMetadata({
  title: "Продать телефон в Казахстане — срочно и без комиссии",
  description:
    "Продайте айфон или Android напрямую покупателю: объявление за пять минут, без комиссии сайта и без перекупов. Как выставить цену, что писать в описании и как безопасно провести встречу.",
  path: "/sell",
});

const STEPS: [string, string][] = [
  [
    "Соберите данные о телефоне",
    "Модель, память, цвет, ёмкость аккумулятора и честный список следов использования. Чем полнее описание, тем меньше переписки и торга.",
  ],
  [
    "Сфотографируйте при дневном свете",
    "6–8 кадров: все стороны корпуса, включённый экран, раздел «Об этом устройстве», коробка и аксессуары.",
  ],
  [
    "Поставьте цену по рынку",
    "Посмотрите страницу своей модели в каталоге: если нужно продать срочно, ставьте нижнюю границу диапазона — такие объявления забирают первыми.",
  ],
  [
    "Дождитесь модерации",
    "Каждое объявление проверяет модератор — это то, из-за чего покупатели доверяют каталогу. О публикации придёт уведомление.",
  ],
  [
    "Встретьтесь и получите деньги",
    "Покупатель отправляет заявку, вы её принимаете и обмениваетесь телефонами. Деньги — при встрече, напрямую вам: сайт в расчётах не участвует.",
  ],
];

export default async function SellPage() {
  const session = await auth();
  const listings = await getPublicListings();
  const models = groupByModel(listings).slice(0, 6);

  const qa = [
    {
      q: "Как продать айфон срочно?",
      a: "Выставьте цену по нижней границе рынка для своей модели и памяти, добавьте честные фото и укажите ёмкость аккумулятора. Объявления с полными данными получают заявки в первые дни — покупателю не нужно ничего выяснять в переписке.",
    },
    {
      q: "Сколько стоит разместить объявление?",
      a: "Бесплатно. Сайт не берёт ни плату за размещение, ни комиссию со сделки — деньги вы получаете от покупателя напрямую.",
    },
    {
      q: "Кто увидит мой номер телефона?",
      a: "Только тот покупатель, чью заявку вы приняли. До этого номер скрыт, в каталоге и в объявлении его нет.",
    },
    {
      q: "Что если телефон не продаётся?",
      a: "Снизьте цену на 5–10% и проверьте фото: чаще всего дело в них. Объявление можно отредактировать в любой момент — после правки оно снова проходит модерацию.",
    },
    {
      q: "Можно ли продать телефон с трещиной или без коробки?",
      a: "Да, если это указано в описании и видно на фото. Скрытые дефекты — причина отказа модератора и испорченной встречи, честные — просто часть цены.",
    },
  ];

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} active="sell" />

      <main id="main-content" className="mx-auto max-w-[900px] px-6 py-8 md:px-10">
        <h1 className="text-28 font-bold leading-tight md:text-40">
          Продать телефон в Казахстане
        </h1>
        <p className="mt-3 max-w-[640px] text-17 leading-relaxed text-text-dim">
          Напрямую покупателю, без перекупов и без комиссии сайта. Объявление создаётся за
          пять минут, модерация проверяет его перед публикацией, а телефон продавца
          открывается только тому, чью заявку вы приняли.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={session?.user ? "/listings/new" : "/register"}
            className={buttonClasses("primary")}
          >
            {session?.user ? "Создать объявление" : "Начать продажу"}
          </Link>
          <Link href="/guides/kak-prodat-telefon-bystro" className={buttonClasses("secondary")}>
            Как продать быстрее
          </Link>
        </div>

        <section aria-labelledby="steps" className="mt-12">
          <h2 id="steps" className="mb-4 text-22 font-bold md:text-28">
            Как это работает
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

        {models.length > 0 && (
          <section aria-labelledby="prices" className="mt-12">
            <h2 id="prices" className="mb-2 text-22 font-bold md:text-28">
              Сколько сейчас просят за похожие телефоны
            </h2>
            <p className="mb-4 text-15 text-text-dim">
              Ориентируйтесь на живые объявления, а не на цену покупки год назад.
            </p>
            <ul className="flex flex-wrap gap-2">
              {models.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/listings/model/${m.slug}`}
                    className="inline-flex items-center gap-2 rounded-pill bg-surface-2 px-4 py-2 text-13 text-text transition-colors duration-150 hover:bg-border"
                  >
                    {m.label}
                    <span className="text-text-dim">от {formatTenge(m.minPrice)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="cities" className="mt-12">
          <h2 id="cities" className="mb-4 text-22 font-bold md:text-28">
            Продать телефон в своём городе
          </h2>
          <CityChips />
        </section>

        <FaqBlock qa={qa} title="Вопросы продавцов" />
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Продать телефон", path: "/sell" }]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
