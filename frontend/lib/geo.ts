/**
 * City hubs — the geo layer of the SEO surface. Kazakh city queries are always typed
 * with a city name ("айфон бу цена Астана"), so every city gets its own indexable
 * page (/telefony-<slug>) plus a brand×city page (/kupit-iphone-<slug>).
 *
 * `in` / `from` are the declined forms Russian copy needs — templating "в Астана"
 * reads like machine text, which is exactly what these pages must not look like.
 *
 * `kk` carries the same three forms for Kazakh, and several cities are a different WORD
 * there, not a transliteration: Уральск is Орал, Усть-Каменогорск is Өскемен. Getting
 * this wrong makes the Kazakh page read as a machine translation of a Russian one.
 *
 * `name` stays the Russian spelling in every case — it is the key listings are matched
 * on (the backend stores the city as typed by the seller), so it must never be localised.
 */

export interface CityForms {
  /** Display name in this language. */
  name: string;
  /** Locative — "в Астане" / "Астанада". */
  in: string;
  /** Ablative — "из Астаны" / "Астанадан". */
  from: string;
}

export interface CityInfo extends CityForms {
  slug: string;
  /** Kazakh display name and declensions. */
  kk: CityForms;
}

export const CITY_HUBS: CityInfo[] = [
  {
    name: "Алматы",
    slug: "almaty",
    in: "в Алматы",
    from: "из Алматы",
    kk: { name: "Алматы", in: "Алматыда", from: "Алматыдан" },
  },
  {
    name: "Астана",
    slug: "astana",
    in: "в Астане",
    from: "из Астаны",
    kk: { name: "Астана", in: "Астанада", from: "Астанадан" },
  },
  {
    name: "Шымкент",
    slug: "shymkent",
    in: "в Шымкенте",
    from: "из Шымкента",
    kk: { name: "Шымкент", in: "Шымкентте", from: "Шымкенттен" },
  },
  {
    name: "Караганда",
    slug: "karaganda",
    in: "в Караганде",
    from: "из Караганды",
    kk: { name: "Қарағанды", in: "Қарағандыда", from: "Қарағандыдан" },
  },
  {
    name: "Актобе",
    slug: "aktobe",
    in: "в Актобе",
    from: "из Актобе",
    kk: { name: "Ақтөбе", in: "Ақтөбеде", from: "Ақтөбеден" },
  },
  {
    name: "Тараз",
    slug: "taraz",
    in: "в Таразе",
    from: "из Тараза",
    kk: { name: "Тараз", in: "Таразда", from: "Тараздан" },
  },
  {
    name: "Павлодар",
    slug: "pavlodar",
    in: "в Павлодаре",
    from: "из Павлодара",
    kk: { name: "Павлодар", in: "Павлодарда", from: "Павлодардан" },
  },
  {
    name: "Усть-Каменогорск",
    slug: "ust-kamenogorsk",
    in: "в Усть-Каменогорске",
    from: "из Усть-Каменогорска",
    kk: { name: "Өскемен", in: "Өскеменде", from: "Өскеменнен" },
  },
  {
    name: "Семей",
    slug: "semey",
    in: "в Семее",
    from: "из Семея",
    kk: { name: "Семей", in: "Семейде", from: "Семейден" },
  },
  {
    name: "Атырау",
    slug: "atyrau",
    in: "в Атырау",
    from: "из Атырау",
    kk: { name: "Атырау", in: "Атырауда", from: "Атыраудан" },
  },
  {
    name: "Костанай",
    slug: "kostanay",
    in: "в Костанае",
    from: "из Костаная",
    kk: { name: "Қостанай", in: "Қостанайда", from: "Қостанайдан" },
  },
  {
    name: "Кызылорда",
    slug: "kyzylorda",
    in: "в Кызылорде",
    from: "из Кызылорды",
    kk: { name: "Қызылорда", in: "Қызылордада", from: "Қызылордадан" },
  },
  {
    name: "Уральск",
    slug: "uralsk",
    in: "в Уральске",
    from: "из Уральска",
    kk: { name: "Орал", in: "Оралда", from: "Оралдан" },
  },
  {
    name: "Петропавловск",
    slug: "petropavlovsk",
    in: "в Петропавловске",
    from: "из Петропавловска",
    kk: { name: "Петропавл", in: "Петропавлда", from: "Петропавлдан" },
  },
  {
    name: "Актау",
    slug: "aktau",
    in: "в Актау",
    from: "из Актау",
    kk: { name: "Ақтау", in: "Ақтауда", from: "Ақтаудан" },
  },
];

export const cityBySlug: Record<string, CityInfo> = Object.fromEntries(
  CITY_HUBS.map((c) => [c.slug, c]),
);

export const cityByName: Record<string, CityInfo> = Object.fromEntries(
  CITY_HUBS.map((c) => [c.name, c]),
);

/** Declined forms for one locale. `name` here is for DISPLAY only — never for matching. */
export function cityForms(city: CityInfo, locale: "ru" | "kk"): CityForms {
  return locale === "kk" ? city.kk : { name: city.name, in: city.in, from: city.from };
}

// Path builders for these hubs live in lib/routes.ts — this module stays pure data so
// the route registry can import it without a cycle.
