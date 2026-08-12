import { notFound, permanentRedirect } from "next/navigation";
import { cityBySlug } from "@/lib/geo";
import { brandBySlug } from "@/lib/phones";
import { brandCityPath } from "@/lib/routes";

/**
 * Legacy path. Brand × city moved to `/kupit-<brand>-<city>`; 308 keeps the old URLs
 * (and anything linking to them) alive.
 */
export default async function LegacyBrandCityHub({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city: citySlug } = await params;
  const brand = brandBySlug[slug];
  const city = cityBySlug[citySlug];
  if (!brand || !city) notFound();
  permanentRedirect(brandCityPath(brand, city));
}
