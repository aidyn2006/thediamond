import Link from "next/link";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { brandNav } from "@/lib/nav";
import { campaignStatusPill, type CampaignStatus } from "@/lib/status";
import { formatTenge } from "@/lib/categories";
import type { BrandCampaignItem } from "@/lib/api-types";

async function loadCampaigns(): Promise<BrandCampaignItem[]> {
  const res = await apiFetch("/api/brand/campaigns");
  if (!res.ok) return [];
  return (await res.json()) as BrandCampaignItem[];
}

function Counter({ href, value, label }: { href: string; value: number; label: string }) {
  return (
    <Link href={href} className="flex flex-col rounded-btn px-3 py-1 hover:bg-surface-2">
      <span className="tabular text-17 font-semibold text-text">{value}</span>
      <span className="text-13 text-text-dim">{label}</span>
    </Link>
  );
}

export default async function DashboardPage() {
  const me = await requireApprovedRole("BRAND");
  const items = await loadCampaigns();

  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-28 font-semibold">Кабинет</h1>
          <Link href="/campaigns/new" className="inline-flex h-11 items-center gap-2 rounded-btn bg-prism px-5 text-15 font-semibold text-bg hover:brightness-110">
            Создать кампанию
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-10 text-center">
            <p className="text-17 font-semibold">Пока нет кампаний</p>
            <p className="mx-auto mt-2 max-w-[46ch] text-15 text-text-dim">
              Создайте первую кампанию — опишите задачу, и креаторы откликнутся.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/campaigns/new" className="inline-flex h-11 items-center rounded-btn bg-prism px-5 text-15 font-semibold text-bg hover:brightness-110">
                Создать кампанию
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(({ campaign: c, counters }) => {
              const pill = campaignStatusPill[c.status as CampaignStatus];
              const manage = `/campaigns/${c.id}/manage`;
              const editable = c.status === "DRAFT" || c.status === "REJECTED";
              return (
                <div key={c.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="text-17 font-semibold">{c.title}</h2>
                        <StatusPill tone={pill.tone} label={pill.label} />
                      </div>
                      <p className="mt-1 tabular text-13 text-text-dim">
                        {formatTenge(c.rewardPerCreator)} · {c.creatorsNeeded} мест · до {c.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {editable && (
                        <Link href={`/campaigns/${c.id}/edit`} className="mr-2 text-13 text-accent">
                          Редактировать
                        </Link>
                      )}
                      <Counter href={`${manage}?tab=applications`} value={counters.applications} label="отклики" />
                      <Counter href={`${manage}?tab=applications`} value={counters.accepted} label="принято" />
                      <Counter href={`${manage}?tab=works`} value={counters.submitted} label="сдано" />
                      <Counter href={`${manage}?tab=works`} value={counters.approved} label="одобрено" />
                    </div>
                  </div>
                  {c.status === "REJECTED" && (
                    <p className="mt-3 border-l-2 border-error pl-3 text-13 text-text-dim">
                      Кампанию отклонили. Отредактируйте и отправьте снова.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
