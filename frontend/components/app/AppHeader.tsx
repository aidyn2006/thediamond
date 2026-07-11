import { signOut } from "@/auth";
import { Logo } from "@/components/ui/Logo";

/**
 * Shared internal app header (design 2.5). Role-specific navigation lands in
 * later stages; for now: logo + current user + sign out.
 */
export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <Logo />
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden text-13 text-text-dim sm:inline">{email}</span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-13 text-accent transition-colors duration-150 hover:brightness-110"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
