import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { Stone } from "@/components/ui/Stone";
import { buttonClasses } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/",
  description:
    "Бренды Казахстана находят UGC-креаторов и микроинфлюенсеров, а креаторы — оплачиваемые задания. Откликайтесь на кампании, сдавайте контент, получайте выплаты в тенге.",
});

const creatorSteps = [
  { title: "Заполните профиль", text: "Расскажите о себе, площадках и аудитории." },
  { title: "Откликайтесь на кампании", text: "Выбирайте задания брендов, которые вам близки." },
  { title: "Сдавайте работу", text: "Публикуйте контент и получайте оплату напрямую." },
];

const brandSteps = [
  { title: "Опубликуйте кампанию", text: "Опишите задачу, площадки и вознаграждение." },
  { title: "Выбирайте креаторов", text: "Смотрите отклики, профили и аудиторию." },
  { title: "Принимайте работы", text: "Согласуйте контент и договоритесь об оплате." },
];

function Steps({ title, steps }: { title: string; steps: { title: string; text: string }[] }) {
  return (
    <div>
      <h3 className="mb-5 text-17 font-semibold">{title}</h3>
      <div className="flex flex-col gap-6 border-l border-border pl-5">
        {steps.map((s) => (
          <div key={s.title}>
            <p className="font-semibold">{s.title}</p>
            <p className="text-15 text-text-dim">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-dvh">
      {/* header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link href="/login" className={buttonClasses("ghost")}>Войти</Link>
            <Link href="/register" className={buttonClasses("primary")}>Начать</Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-10">
        <div>
          <h1 className="font-display text-40 font-semibold md:text-56">Контент, который работает</h1>
          <p className="mt-6 max-w-[46ch] text-17 text-text-dim">
            Платформа, где бренды Казахстана находят креаторов, а креаторы — заработок.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register?role=CREATOR" className={buttonClasses("primary")}>Я креатор</Link>
            <Link href="/register?role=BRAND" className={buttonClasses("secondary")}>Я бренд</Link>
          </div>
        </div>
        <div className="order-first flex justify-center md:order-last">
          <Stone size={280} spin className="opacity-90" />
        </div>
      </section>

      {/* how it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10">
          <h2 className="mb-10 text-28 font-semibold">Как это работает</h2>
          <div className="grid gap-10 md:grid-cols-2">
            <Steps title="Креаторам" steps={creatorSteps} />
            <Steps title="Брендам" steps={brandSteps} />
          </div>
        </div>
      </section>

      {/* stats strip */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
          <p className="tabular text-center text-17 text-text-dim">
            140+ креаторов · 4 платформы · выплаты в ₸
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 py-20 text-center md:px-10">
          <h2 className="font-display text-28 font-semibold md:text-40">Начните сегодня</h2>
          <Link href="/register" className={buttonClasses("primary")}>Начать</Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-10 text-13 text-text-dim md:flex-row md:items-center md:justify-between md:px-10">
          <Logo />
          <a href="mailto:hello@thediamond.kz" className="hover:text-text">hello@thediamond.kz</a>
          <div className="flex gap-4">
            <span>Instagram</span>
            <span>TikTok</span>
            <span>Telegram</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
