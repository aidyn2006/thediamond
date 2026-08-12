import type { Metadata } from "next";
import { HubDispatch, hubMetadata } from "@/components/hubs/dispatch";

/** Kazakh twin of app/[slug] — same hubs, Kazakh slugs (/kk/telefondar-almaty, …). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return hubMetadata(slug, "kk");
}

export default async function KkHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HubDispatch slug={slug} locale="kk" />;
}
