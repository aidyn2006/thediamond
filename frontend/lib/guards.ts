import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/api";
import { roleHome, type Role } from "@/lib/types";
import type { UserSummary } from "@/lib/types";

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

/**
 * Full gate for the working area: correct role + onboarding done + approved.
 * Sends the user to onboarding / pending as needed. Returns the fresh user.
 */
export async function requireApprovedRole(role: Role): Promise<UserSummary> {
  await requireRole(role);
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.onboardingComplete) redirect("/onboarding");
  if (!me.approved) redirect("/pending");
  return me;
}
