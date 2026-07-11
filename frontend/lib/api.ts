import { auth } from "@/auth";
import type { UserSummary } from "@/lib/types";

export const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

/**
 * Server-side fetch to the Java backend. Attaches the current user's backend
 * JWT (from the Auth.js session) as a Bearer token. Never call from the client.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const session = await auth();
  const headers = new Headers(init?.headers);
  if (session?.backendToken) {
    headers.set("Authorization", `Bearer ${session.backendToken}`);
  }
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

/** Fresh current-user snapshot from the backend (role, onboarding, approval). */
export async function getCurrentUser(): Promise<UserSummary | null> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) return null;
  return (await res.json()) as UserSummary;
}
