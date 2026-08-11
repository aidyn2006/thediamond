import { formatNumber } from "@/lib/phones";

/**
 * Price for OG share cards. The bundled OG font has no ₸ (U+20B8) glyph, so Satori
 * draws a tofu box in its place — share cards spell the currency out instead. In the
 * app itself (real webfonts) `formatTenge` and the ₸ symbol are fine.
 */
export function ogPrice(n: number): string {
  return `${formatNumber(n)} тг`;
}
