import { cache } from "react";
import { auth } from "@/auth";
import type { UserSummary } from "@/lib/types";
import type {
  CatalogFilters,
  ListingSummary,
  PublicListing,
  PublicSeller,
} from "@/lib/api-types";

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

/** Fresh current-user snapshot from the backend (role, onboarding, verification). */
export async function getCurrentUser(): Promise<UserSummary | null> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) return null;
  return (await res.json()) as UserSummary;
}

function toQuery(filters?: CatalogFilters): string {
  const qs = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value != null && value !== "") qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs}` : "";
}

/**
 * Active listings for the public catalog + sitemap. Never throws — an empty list
 * on failure keeps SSR and `next build` green when the backend is down.
 */
export async function getPublicListings(
  filters?: CatalogFilters,
): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/public/listings${toQuery(filters)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return (await res.json()) as ListingSummary[];
  } catch {
    return [];
  }
}

/**
 * Public listing page. Wrapped in React `cache()` so generateMetadata and the page
 * component share one backend call. Returns null on failure so callers `notFound()`.
 */
export const getPublicListing = cache(
  async (id: string): Promise<PublicListing | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/listings/${id}`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      return (await res.json()) as PublicListing;
    } catch {
      return null;
    }
  },
);

export const getPublicSeller = cache(
  async (id: string): Promise<PublicSeller | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/sellers/${id}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      return (await res.json()) as PublicSeller;
    } catch {
      return null;
    }
  },
);
