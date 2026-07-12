export const CATEGORIES = [
  "FOOD",
  "BEAUTY",
  "TECH",
  "CARS",
  "LIFESTYLE",
  "GAMING",
  "FASHION",
  "TRAVEL",
  "EDUCATION",
  "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const categoryLabels: Record<Category, string> = {
  FOOD: "Еда",
  BEAUTY: "Красота",
  TECH: "Технологии",
  CARS: "Авто",
  LIFESTYLE: "Лайфстайл",
  GAMING: "Игры",
  FASHION: "Мода",
  TRAVEL: "Путешествия",
  EDUCATION: "Образование",
  OTHER: "Другое",
};

export const PLATFORMS = ["TIKTOK", "INSTAGRAM", "THREADS", "YOUTUBE"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const platformLabels: Record<Platform, string> = {
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  THREADS: "Threads",
  YOUTUBE: "YouTube",
};

/** Formats an integer with thin spaces as thousands separators (KZ style). */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU").replace(/,/g, " ");
}

/** Formats a tenge amount, e.g. 45000 -> "45 000 ₸". */
export function formatTenge(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${formatNumber(n)} ₸`;
}
