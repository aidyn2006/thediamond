import Link from "next/link";
import { signOut } from "@/auth";
import { Logo } from "@/components/ui/Logo";
import { MobileTabBar } from "./MobileTabBar";
import { NotificationBell } from "./NotificationBell";
import { fetchNotifications } from "@/app/notifications/actions";

export interface NavItem {
  href: string;
  label: string;
}

/** Shared internal app header (design 2.5): logo + role nav + notifications + user + sign out. */
export async function AppHeader({
  email,
  items = [],
}: {
  email?: string | null;
  items?: NavItem[];
}) {
  const notifications = await fetchNotifications();
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Основная навигация" className="hidden items-center gap-6 md:flex">
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
          <NotificationBell initial={notifications} />
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
      <MobileTabBar items={items} />
    </header>
  );
}
