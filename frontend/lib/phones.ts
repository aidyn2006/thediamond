/** Phone taxonomy shared by the catalog filters, the listing form and SEO hubs. */

export const PHONE_BRANDS = [
  "APPLE",
  "SAMSUNG",
  "XIAOMI",
  "HUAWEI",
  "HONOR",
  "GOOGLE",
  "OPPO",
  "VIVO",
  "REALME",
  "ONEPLUS",
  "TECNO",
  "INFINIX",
  "NOKIA",
  "ZTE",
  "OTHER",
] as const;

export type PhoneBrand = (typeof PHONE_BRANDS)[number];

export const brandLabels: Record<PhoneBrand, string> = {
  APPLE: "Apple",
  SAMSUNG: "Samsung",
  XIAOMI: "Xiaomi",
  HUAWEI: "Huawei",
  HONOR: "Honor",
  GOOGLE: "Google Pixel",
  OPPO: "OPPO",
  VIVO: "vivo",
  REALME: "realme",
  ONEPLUS: "OnePlus",
  TECNO: "TECNO",
  INFINIX: "Infinix",
  NOKIA: "Nokia",
  ZTE: "ZTE",
  OTHER: "Другой бренд",
};

/**
 * How people actually search for the brand. Nobody types "Apple б/у Астана" — they type
 * "iphone бу Астана", so hub titles use these instead of the display labels.
 */
export const brandQueryLabels: Record<PhoneBrand, string> = {
  APPLE: "iPhone",
  SAMSUNG: "Samsung",
  XIAOMI: "Xiaomi",
  HUAWEI: "Huawei",
  HONOR: "Honor",
  GOOGLE: "Google Pixel",
  OPPO: "OPPO",
  VIVO: "vivo",
  REALME: "realme",
  ONEPLUS: "OnePlus",
  TECNO: "TECNO",
  INFINIX: "Infinix",
  NOKIA: "Nokia",
  ZTE: "ZTE",
  OTHER: "Телефоны других брендов",
};

/** Cyrillic spelling used in copy so pages contain the phrase people type. */
export const brandRuLabels: Partial<Record<PhoneBrand, string>> = {
  APPLE: "айфон",
  SAMSUNG: "самсунг",
  XIAOMI: "сяоми",
  HUAWEI: "хуавей",
  HONOR: "хонор",
  REALME: "реалми",
};

/** URL slug per brand for the public catalog hubs (/listings/brand/[slug]). */
export const brandSlugs: Record<PhoneBrand, string> = {
  APPLE: "apple",
  SAMSUNG: "samsung",
  XIAOMI: "xiaomi",
  HUAWEI: "huawei",
  HONOR: "honor",
  GOOGLE: "google-pixel",
  OPPO: "oppo",
  VIVO: "vivo",
  REALME: "realme",
  ONEPLUS: "oneplus",
  TECNO: "tecno",
  INFINIX: "infinix",
  NOKIA: "nokia",
  ZTE: "zte",
  OTHER: "other",
};

export const brandBySlug: Record<string, PhoneBrand> = Object.fromEntries(
  (Object.entries(brandSlugs) as [PhoneBrand, string][]).map(([b, slug]) => [slug, b]),
);

export const PHONE_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "FOR_PARTS"] as const;

export type PhoneCondition = (typeof PHONE_CONDITIONS)[number];

export const conditionLabels: Record<PhoneCondition, string> = {
  NEW: "Новый",
  LIKE_NEW: "Как новый",
  GOOD: "Хорошее",
  FAIR: "Есть следы",
  FOR_PARTS: "На запчасти",
};

/** Longer copy shown next to the radio in the listing form. */
export const conditionHints: Record<PhoneCondition, string> = {
  NEW: "Запечатан или не использовался",
  LIKE_NEW: "Без царапин и потёртостей",
  GOOD: "Мелкие потёртости, экран целый",
  FAIR: "Заметные следы использования",
  FOR_PARTS: "Не работает полностью",
};

/** Storage sizes offered in the form and the "от N ГБ" filter. */
export const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024] as const;

export function storageLabel(gb: number): string {
  return gb >= 1024 ? `${gb / 1024} ТБ` : `${gb} ГБ`;
}

/** Cities with enough supply to be worth offering as a filter. */
export const CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Атырау",
  "Костанай",
  "Кызылорда",
  "Уральск",
  "Петропавловск",
  "Актау",
] as const;

/** Formats an integer with thin spaces as thousands separators (KZ style). */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}

/** Formats a tenge amount, e.g. 245000 -> "245 000 ₸". */
export function formatTenge(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${formatNumber(n)} ₸`;
}

/** "сегодня" / "вчера" / "3 дня назад" for listing cards. */
export function relativeDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}
