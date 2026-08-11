import type { NavItem } from "@/components/app/AppHeader";

/** One nav for everyone — the same account sells and buys. */
export const memberNav: NavItem[] = [
  { href: "/listings", label: "Каталог" },
  { href: "/my-listings", label: "Мои объявления" },
  { href: "/deals", label: "Сделки" },
  { href: "/favorites", label: "Избранное" },
  { href: "/profile", label: "Профиль" },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Модерация" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/stats", label: "Статистика" },
];
