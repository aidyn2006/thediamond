import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { MyApplicationsList } from "@/components/application/MyApplicationsList";
import { creatorNav } from "@/lib/nav";
import type { MyApplication } from "@/lib/api-types";

async function load(): Promise<MyApplication[]> {
  const res = await apiFetch("/api/my-applications");
  if (!res.ok) return [];
  return (await res.json()) as MyApplication[];
}

export default async function MyApplicationsPage() {
  const me = await requireApprovedRole("CREATOR");
  const apps = await load();
  return (
    <>
      <AppHeader email={me.email} items={creatorNav} />
      <main className="mx-auto max-w-[800px] px-6 py-8 pb-24 md:px-10 md:pb-8">
        <h1 className="mb-6 text-28 font-semibold">Мои отклики</h1>
        <MyApplicationsList apps={apps} />
      </main>
    </>
  );
}
