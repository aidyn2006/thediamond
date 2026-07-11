import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { roleHome, type Role } from "@/lib/types";

/** Server guard: require an authenticated session (any role). */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Server guard: require a specific role; wrong roles bounce to their own home. */
export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.user.role !== role) redirect(roleHome(session.user.role));
  return session;
}
