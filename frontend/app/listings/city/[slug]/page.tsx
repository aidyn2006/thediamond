import { notFound, permanentRedirect } from "next/navigation";
import { cityBySlug } from "@/lib/geo";
import { cityPath } from "@/lib/routes";

/**
 * Legacy path. City hubs moved to the flat keyword slug (`/telefony-almaty`); this
 * 308s so the links already indexed keep their weight instead of dying in a 404.
 */
export default async function LegacyCityHub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = cityBySlug[slug];
  if (!city) notFound();
  permanentRedirect(cityPath(city));
}
