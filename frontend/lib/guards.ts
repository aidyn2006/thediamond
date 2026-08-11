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
 * Gate for member screens: signed in, not an admin, contact profile filled.
 * Sends the user to onboarding when the profile is still missing.
 */
export async function requireMember(): Promise<UserSummary> {
  await requireRole("USER");
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.onboardingComplete) redirect("/onboarding");
  return me;
}

/**
 * Softer variant for screens that only need a session — browsing the catalog and
 * favourites works before the profile is filled; posting and buying do not.
 */
export async function requireSignedIn(): Promise<UserSummary> {
  await requireAuth();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  return me;
}
