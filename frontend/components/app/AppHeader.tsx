import Link from "next/link";
import { signOut } from "@/auth";
import { Logo } from "@/components/ui/Logo";

export interface NavItem {
  href: string;
  label: string;
}

/** Shared internal app header (design 2.5): logo + role nav + user + sign out. */
export function AppHeader({
  email,
  items = [],
}: {
  email?: string | null;
  items?: NavItem[];
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-15 text-text-dim transition-colors duration-150 hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden text-13 text-text-dim sm:inline">{email}</span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-13 text-accent transition-colors duration-150 hover:brightness-110"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
