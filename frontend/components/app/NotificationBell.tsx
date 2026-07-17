"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchNotifications, markNotificationsRead } from "@/app/notifications/actions";
import type { NotificationItem, NotificationList } from "@/lib/api-types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

export function NotificationBell({ initial }: { initial: NotificationList }) {
  const [data, setData] = useState<NotificationList>(initial);
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && data.unread > 0) {
      // optimistically clear the badge, then persist + refresh
      setData((d) => ({ ...d, unread: 0 }));
      start(async () => {
        await markNotificationsRead();
        const fresh = await fetchNotifications();
        setData(fresh);
      });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          data.unread > 0
            ? `Уведомления, непрочитанных: ${data.unread}`
            : "Уведомления"
        }
        className="relative flex h-9 w-9 items-center justify-center rounded-btn text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {data.unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-bg"
          >
            {data.unread > 9 ? "9+" : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-card border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3 text-13 font-semibold text-text-dim">
            Уведомления
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-13 text-text-dim">Пока пусто</p>
            ) : (
              data.items.map((n: NotificationItem) => (
                <div key={n.id} className="border-b border-border px-4 py-3 last:border-b-0">
                  <p className="text-15 font-medium text-text">{n.title}</p>
                  <p className="mt-0.5 text-13 text-text-dim">{n.body}</p>
                  <p className="mt-1 text-[11px] text-text-dim/70">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
