import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";

/** Shared header for public (logged-out) pages: catalog, hubs, creator profiles. */
export function PublicHeader({ maxWidth = "1200px" }: { maxWidth?: string }) {
  return (
    <header className="border-b border-border">
      <div
        className="mx-auto flex h-16 items-center justify-between px-6 md:px-10"
        style={{ maxWidth }}
      >
        <Logo />
        <nav aria-label="Навигация" className="flex items-center gap-3">
          <Link href="/login" className={buttonClasses("ghost")}>
            Войти
          </Link>
          <Link href="/register" className={buttonClasses("primary")}>
            Начать
          </Link>
        </nav>
      </div>
    </header>
  );
}
