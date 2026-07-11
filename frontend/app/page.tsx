import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link href="/login" className={buttonClasses("ghost")}>
              Войти
            </Link>
            <Link href="/register" className={buttonClasses("primary")}>
              Начать
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 py-24 md:px-10">
        <h1 className="font-display max-w-[12ch] text-40 font-semibold md:text-56">
          Контент, который работает
        </h1>
        <p className="mt-6 max-w-[52ch] text-17 text-text-dim">
          Платформа, где бренды Казахстана находят креаторов, а креаторы —
          заработок.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register?role=CREATOR"
            className={buttonClasses("primary")}
          >
            Я креатор
          </Link>
          <Link
            href="/register?role=BRAND"
            className={buttonClasses("secondary")}
          >
            Я бренд
          </Link>
        </div>

        <p className="mt-16 text-13 text-text-dim">
          Полный лендинг с вращающимся камнем и разделами «Как это работает»
          собираем на этапе 8.
        </p>
      </section>
    </main>
  );
}
