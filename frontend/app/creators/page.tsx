import { Suspense } from "react";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { CreatorCard } from "@/components/catalog/CreatorCard";
import { CreatorFilters } from "@/components/catalog/CreatorFilters";
import { brandNav } from "@/lib/nav";
import type { CreatorProfileResponse } from "@/lib/api-types";

async function load(qs: string): Promise<CreatorProfileResponse[]> {
  const res = await apiFetch(`/api/creators${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  return (await res.json()) as CreatorProfileResponse[];
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  const me = await requireApprovedRole("BRAND");
  const sp = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  ).toString();
  const creators = await load(qs);

  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <h1 className="mb-6 text-28 font-semibold">Креаторы</h1>
        <div className="mb-8">
          <Suspense>
            <CreatorFilters />
          </Suspense>
        </div>

        {creators.length === 0 ? (
          <p className="py-16 text-center text-15 text-text-dim">
            Пока никого не нашли. Попробуйте изменить фильтры.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
