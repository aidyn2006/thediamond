import type { Metadata } from "next";
import { HubDispatch, hubMetadata } from "@/components/hubs/dispatch";

/**
 * Every SEO hub lives at the root under a keyword slug — `/telefony-almaty`,
 * `/kupit-iphone`, `/kupit-iphone-almaty`, `/apple-iphone-13`. Next only matches whole
 * segments, so one catch-all resolves the slug and hands off to the right hub.
 *
 * Static routes (`/listings`, `/sell`, `/login`, …) take precedence over this file, and
 * RESERVED_ROOT_SEGMENTS keeps a hub slug from ever shadowing one of them.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return hubMetadata(slug, "ru");
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HubDispatch slug={slug} locale="ru" />;
}
