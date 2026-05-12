"use client";

import type { UserRole } from "@/lib/user-role";

const ROLE_ROWS: readonly {
  id: UserRole;
  emoji: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "founder",
    emoji: "🚀",
    title: "Founder",
    subtitle: "Pitch decks, conflict map, version tracking.",
  },
  {
    id: "student",
    emoji: "🎓",
    title: "Student Builder",
    subtitle: "Same analysis flow with lighter org surface.",
  },
  {
    id: "accelerator",
    emoji: "🏛️",
    title: "Accelerator Manager",
    subtitle: "Org workspace, cohort scale (coming soon).",
  },
  {
    id: "angel",
    emoji: "💰",
    title: "Angel Investor",
    subtitle: "Quick triage & memos (coming soon).",
  },
  {
    id: "mentor",
    emoji: "🧭",
    title: "Mentor / Advisor",
    subtitle: "Shared analyses & overlays (coming soon).",
  },
];

type Props = {
  pendingRole: UserRole | null;
  onPick: (role: UserRole) => void | Promise<void>;
};

export function RolePicker({ pendingRole, onPick }: Props) {
  return (
    <div className="flex flex-col gap-3 mt-8">
      {ROLE_ROWS.map((row) => {
        const loading = pendingRole === row.id;
        return (
          <button
            key={row.id}
            type="button"
            disabled={pendingRole !== null}
            aria-busy={loading}
            onClick={() => onPick(row.id)}
            className="text-left rounded-2xl border border-cream-400 bg-cream-100/80 px-4 py-4 transition-all duration-300 hover:border-ink/20 hover:bg-cream-50 disabled:opacity-60 disabled:pointer-events-none"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">{row.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink">{row.title}</div>
                <p className="text-sm text-ink-400 mt-0.5 leading-snug">
                  {row.subtitle}
                </p>
              </div>
              <span className="text-xs text-ink-300 tabular-nums">
                {loading ? "Saving…" : ""}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
