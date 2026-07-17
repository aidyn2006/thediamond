import { notFound } from "next/navigation";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { PlatformPills } from "@/components/campaign/PlatformPills";
import { ApplyButton } from "@/components/campaign/ApplyButton";
import { creatorNav } from "@/lib/nav";
import { formatTenge, categoryLabels } from "@/lib/categories";
import type { CampaignDetail } from "@/lib/api-types";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireApprovedRole("CREATOR");
  const { id } = await params;
  const res = await apiFetch(`/api/campaigns/${id}`);
  if (!res.ok) notFound();
  const c = (await res.json()) as CampaignDetail;

  return (
    <>
      <AppHeader email={me.email} items={creatorNav} />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-8 pb-28 md:px-10 md:pb-8">
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          {/* left: description */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <BrandAvatar name={c.brandName} />
              <span className="text-13 text-text-dim">{c.brandName}</span>
            </div>
            <h1 className="text-28 font-semibold">{c.title}</h1>
            <p className="mt-2 text-13 text-text-dim">{categoryLabels[c.category]}</p>

            <section className="mt-6">
              <h2 className="mb-2 text-15 font-semibold">Описание</h2>
              <p className="whitespace-pre-line text-15 text-text-dim">{c.description}</p>
            </section>

            <section className="mt-6">
              <h2 className="mb-2 text-15 font-semibold">Требования</h2>
              <p className="whitespace-pre-line text-15 text-text-dim">{c.requirements}</p>
            </section>
          </div>

          {/* right: sidebar (desktop) */}
          <aside className="hidden md:block">
            <div className="sticky top-6 rounded-card border border-border bg-surface p-5">
              <div className="tabular text-40 font-semibold">{formatTenge(c.rewardPerCreator)}</div>
              <p className="mt-1 text-13 text-text-dim">вознаграждение за креатора</p>
              <dl className="mt-4 flex flex-col gap-2 text-15">
                <div className="flex justify-between">
                  <dt className="text-text-dim">Дедлайн</dt>
                  <dd>{c.deadline}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-dim">Осталось мест</dt>
                  <dd className="tabular">{c.slotsLeft}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <PlatformPills platforms={c.platforms} />
              </div>
              <div className="mt-5">
                <ApplyButton campaignId={c.id} canApply={c.canApply} blockReason={c.applyBlockReason} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-4 md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="tabular text-22 font-semibold">{formatTenge(c.rewardPerCreator)}</span>
          <span className="text-13 text-text-dim">осталось {c.slotsLeft} мест</span>
        </div>
        <ApplyButton campaignId={c.id} canApply={c.canApply} blockReason={c.applyBlockReason} />
      </div>
    </>
  );
}
