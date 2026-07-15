"use server";

import { apiFetch } from "@/lib/api";
import type { NotificationList } from "@/lib/api-types";

export async function fetchNotifications(): Promise<NotificationList> {
  const res = await apiFetch("/api/notifications");
  if (!res.ok) return { unread: 0, items: [] };
  return (await res.json()) as NotificationList;
}

export async function markNotificationsRead(): Promise<{ ok: boolean }> {
  const res = await apiFetch("/api/notifications/read", { method: "POST" });
  return { ok: res.ok };
}
