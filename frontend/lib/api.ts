import { cache } from "react";
import { auth } from "@/auth";
import type { UserSummary } from "@/lib/types";
import type { PublicCreatorProfile } from "@/lib/api-types";

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

/**
 * Public creator profile — no auth. Wrapped in React `cache()` so a single
 * request (generateMetadata + the page component) hits the backend only once.
 * Returns null on any failure so callers can `notFound()` cleanly.
 */
export const getPublicCreator = cache(
  async (id: string): Promise<PublicCreatorProfile | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/creators/${id}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      return (await res.json()) as PublicCreatorProfile;
    } catch {
      return null;
    }
  },
);

/**
 * Approved public creators for the catalog + sitemap, optionally filtered by
 * category / city. Never throws — empty list on failure (backend down at build,
 * etc.) so SSR and `next build` stay green.
 */
export async function getPublicCreators(
  params?: { category?: string; city?: string },
): Promise<PublicCreatorProfile[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.city) qs.set("city", params.city);
  const suffix = qs.toString() ? `?${qs}` : "";
  try {
    const res = await fetch(`${BACKEND_URL}/api/public/creators${suffix}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()) as PublicCreatorProfile[];
  } catch {
    return [];
  }
}
