import { notFound, permanentRedirect } from "next/navigation";
import { brandBySlug } from "@/lib/phones";
import { brandPath } from "@/lib/routes";

/**
 * Legacy path. Brand hubs moved to `/kupit-<brand>`; this 308s so indexed links and any
 * external backlinks keep pointing at a live page.
 */
export default async function LegacyBrandHub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = brandBySlug[slug];
  if (!brand) notFound();
  permanentRedirect(brandPath(brand));
}
