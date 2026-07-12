import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  CreatorModerationTable,
  BrandModerationTable,
} from "@/components/admin/ModerationTable";
import type {
  CreatorProfileResponse,
  BrandProfileResponse,
} from "@/lib/api-types";

async function load<T>(path: string): Promise<T[]> {
  const res = await apiFetch(path);
  if (!res.ok) return [];
  return (await res.json()) as T[];
}

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "brands" ? "brands" : "creators";

  const [creators, brands] = await Promise.all([
    load<CreatorProfileResponse>("/api/admin/creators"),
    load<BrandProfileResponse>("/api/admin/brands"),
  ]);

  const creatorsPending = creators.filter((c) => !c.approved).length;
  const brandsPending = brands.filter((b) => !b.approved).length;

  const tabClass = (active: boolean) =>
    cn(
      "border-b-2 pb-2 text-15 transition-colors duration-150",
      active ? "border-accent text-text" : "border-transparent text-text-dim hover:text-text",
    );

  return (
    <div>
      <h1 className="mb-6 text-28 font-semibold">Модерация профилей</h1>

      <div className="mb-6 flex gap-6 border-b border-border">
        <Link href="/admin/profiles?tab=creators" className={tabClass(activeTab === "creators")}>
          Креаторы ({creatorsPending})
        </Link>
        <Link href="/admin/profiles?tab=brands" className={tabClass(activeTab === "brands")}>
          Бренды ({brandsPending})
        </Link>
      </div>

      {activeTab === "creators" ? (
        <CreatorModerationTable rows={creators} />
      ) : (
        <BrandModerationTable rows={brands} />
      )}
    </div>
  );
}
