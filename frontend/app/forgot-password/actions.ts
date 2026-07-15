"use server";

import { BACKEND_URL } from "@/lib/api";

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean }> {
  // Backend always answers 200 (no email enumeration). We mirror that: any
  // outcome shows the same "check your inbox" message on the client.
  try {
    await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch {
    // swallow — still show the neutral confirmation
  }
  return { ok: true };
}
