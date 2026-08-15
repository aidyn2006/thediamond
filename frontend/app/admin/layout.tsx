import { requireRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");
  return (
    <>
      <AppHeader email={session.user.email} home="/admin" />
      {/* The sidebar only becomes a sidebar from md up: 176px of nav next to a 360px
          screen left the content column ~100px wide. */}
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 md:flex-row md:gap-8 md:px-10">
        <aside className="md:w-44 md:shrink-0">
          <AdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
