import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { Stone } from "@/components/ui/Stone";
import { FeedFilters } from "@/components/campaign/FeedFilters";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { creatorNav } from "@/lib/nav";
import type { CampaignFeedItem } from "@/lib/api-types";
import { Suspense } from "react";

async function loadFeed(qs: string): Promise<CampaignFeedItem[]> {
  const res = await apiFetch(`/api/campaigns${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  return (await res.json()) as CampaignFeedItem[];
}

export default async function CampaignsFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; platform?: string }>;
}) {
  const me = await requireApprovedRole("CREATOR");
  const sp = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  ).toString();
  const items = await loadFeed(qs);

  return (
    <>
      <AppHeader email={me.email} items={creatorNav} />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-8 pb-24 md:px-10 md:pb-8">
        <h1 className="mb-6 text-28 font-semibold">Кампании</h1>

        <div className="mb-8">
          <Suspense>
            <FeedFilters />
          </Suspense>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Stone size={120} className="mb-6 opacity-70" />
            <p className="max-w-[42ch] text-15 text-text-dim">
              Пока нет активных кампаний. Загляните завтра — бренды публикуют новые
              задания каждый день.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <CampaignCard key={item.campaign.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
