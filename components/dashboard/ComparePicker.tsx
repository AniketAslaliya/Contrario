"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  title: string;
  created_at: string;
};

export function ComparePicker({ analyses }: { analyses: Row[] }) {
  const router = useRouter();
  const options = useMemo(() => analyses, [analyses]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  function goCompare() {
    if (!a || !b || a === b) return;
    router.push(`/dashboard/compare?v1=${encodeURIComponent(a)}&v2=${encodeURIComponent(b)}`);
  }

  return (
    <div className="rounded-3xl border border-cream-400 bg-cream-100/60 p-6 md:p-8 max-w-xl mx-auto">
      <p className="text-sm text-ink-600 mb-4 leading-relaxed">
        Pick two saved runs (typically an older deck vs a revision). We&apos;ll
        show score deltas, key-concern shifts, and consensus red-flag changes.
      </p>
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.12em] text-ink-400 block mb-2">
            Version 1 — baseline
          </span>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full rounded-xl border border-cream-400 bg-cream-100 px-4 py-3 text-sm text-ink"
          >
            <option value="">Select…</option>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} —{" "}
                {new Date(r.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.12em] text-ink-400 block mb-2">
            Version 2 — newer
          </span>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full rounded-xl border border-cream-400 bg-cream-100 px-4 py-3 text-sm text-ink"
          >
            <option value="">Select…</option>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} —{" "}
                {new Date(r.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={goCompare}
          disabled={!a || !b || a === b}
          className="btn-primary w-full !rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
        >
          Compare
        </button>
      </div>
    </div>
  );
}
