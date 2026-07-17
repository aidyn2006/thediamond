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
      <div className="mx-auto flex max-w-[1200px] gap-8 px-6 py-8 md:px-10">
        <aside className="w-44 shrink-0">
          <AdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
