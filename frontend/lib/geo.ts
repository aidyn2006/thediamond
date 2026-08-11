/**
 * City hubs — the geo layer of the SEO surface. Kazakh city queries are always typed
 * with a city name ("айфон бу цена Астана"), so every city gets its own indexable
 * page at /listings/city/<slug> and a brand×city page under the brand hub.
 *
 * `in` / `from` are the declined forms Russian copy needs — templating "в Астана"
 * reads like machine text, which is exactly what these pages must not look like.
 */

export interface CityInfo {
  name: string;
  slug: string;
  /** Prepositional: "в Астане". */
  in: string;
  /** Genitive after "из": "из Астаны". */
  from: string;
}

export const CITY_HUBS: CityInfo[] = [
  { name: "Алматы", slug: "almaty", in: "в Алматы", from: "из Алматы" },
  { name: "Астана", slug: "astana", in: "в Астане", from: "из Астаны" },
  { name: "Шымкент", slug: "shymkent", in: "в Шымкенте", from: "из Шымкента" },
  { name: "Караганда", slug: "karaganda", in: "в Караганде", from: "из Караганды" },
  { name: "Актобе", slug: "aktobe", in: "в Актобе", from: "из Актобе" },
  { name: "Тараз", slug: "taraz", in: "в Таразе", from: "из Тараза" },
  { name: "Павлодар", slug: "pavlodar", in: "в Павлодаре", from: "из Павлодара" },
  {
    name: "Усть-Каменогорск",
    slug: "ust-kamenogorsk",
    in: "в Усть-Каменогорске",
    from: "из Усть-Каменогорска",
  },
  { name: "Семей", slug: "semey", in: "в Семее", from: "из Семея" },
  { name: "Атырау", slug: "atyrau", in: "в Атырау", from: "из Атырау" },
  { name: "Костанай", slug: "kostanay", in: "в Костанае", from: "из Костаная" },
  { name: "Кызылорда", slug: "kyzylorda", in: "в Кызылорде", from: "из Кызылорды" },
  { name: "Уральск", slug: "uralsk", in: "в Уральске", from: "из Уральска" },
  {
    name: "Петропавловск",
    slug: "petropavlovsk",
    in: "в Петропавловске",
    from: "из Петропавловска",
  },
  { name: "Актау", slug: "aktau", in: "в Актау", from: "из Актау" },
];

export const cityBySlug: Record<string, CityInfo> = Object.fromEntries(
  CITY_HUBS.map((c) => [c.slug, c]),
);

export const cityByName: Record<string, CityInfo> = Object.fromEntries(
  CITY_HUBS.map((c) => [c.name, c]),
);

export function cityPath(city: CityInfo): string {
  return `/listings/city/${city.slug}`;
}

export function brandCityPath(brandSlug: string, city: CityInfo): string {
  return `/listings/brand/${brandSlug}/${city.slug}`;
}
