import { permanentRedirect } from "next/navigation";
import { modelPath } from "@/lib/routes";

/**
 * Legacy path. Model hubs moved to the bare slug (`/apple-iphone-13`). The redirect is
 * unconditional: whether the model still has listings is the destination's call, so a
 * disappearing model 404s in exactly one place instead of two.
 */
export default async function LegacyModelHub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(modelPath(slug));
}
