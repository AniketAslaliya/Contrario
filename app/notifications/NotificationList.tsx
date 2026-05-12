"use client";

import { markNotificationReadAction } from "@/app/notifications/notification-actions";

type Row = {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function NotificationList({ initial }: { initial: Row[] }) {
  async function mark(id: string) {
    await markNotificationReadAction(id);
    window.location.reload();
  }

  if (initial.length === 0) {
    return (
      <p className="text-sm text-ink-500">No notifications yet — run analyses while signed in.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {initial.map((n) => (
        <li
          key={n.id}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            n.read
              ? "border-cream-400/60 bg-cream-100/40 text-ink-500"
              : "border-cream-400 bg-cream-100/80 text-ink"
          }`}
        >
          <p>{n.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-ink-400">
              {new Date(n.created_at).toLocaleString()}
            </span>
            {!n.read ? (
              <button
                type="button"
                onClick={() => mark(n.id)}
                className="text-xs text-ink-500 hover:text-ink underline"
              >
                Mark read
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
