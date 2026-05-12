"use client";

import { useId, useState } from "react";
import {
  PASTE_MAX_CHARS,
  PASTE_MIN_CHARS,
  STORAGE_PENDING_META,
  STORAGE_PENDING_TEXT,
} from "@/lib/analyze-input";

export function TextInput({ onPitchReady }: { onPitchReady?: () => void }) {
  const hintId = useId();
  const [text, setText] = useState("");

  const len = text.length;
  const ok = len >= PASTE_MIN_CHARS && len <= PASTE_MAX_CHARS;

  function syncToStorage(value: string) {
    try {
      sessionStorage.setItem(STORAGE_PENDING_TEXT, value);
      sessionStorage.setItem(
        STORAGE_PENDING_META,
        JSON.stringify({
          source: "paste",
          at: Date.now(),
          chars: value.length,
        })
      );
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-2 text-left">
      <label htmlFor="pitch-paste" className="sr-only">
        Paste pitch text
      </label>
      <textarea
        id="pitch-paste"
        value={text}
        onChange={(e) => {
          const v = e.target.value.slice(0, PASTE_MAX_CHARS);
          setText(v);
          syncToStorage(v);
          onPitchReady?.();
        }}
        title="What to include: problem, target customer, why now, traction or proof, ask, and what makes your team the one to win."
        placeholder="Paste your elevator pitch, problem, solution, traction — minimum 100 characters."
        rows={12}
        className="w-full rounded-2xl border border-cream-400 bg-cream-100/80 px-4 py-3 text-sm text-ink placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ink/10 min-h-[220px]"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 text-xs text-ink-400">
        <p id={hintId} className="leading-relaxed max-w-md">
          <span className="text-ink font-medium">Include:</span> problem, target
          customer, why now, traction or proof, ask, and team edge.{" "}
          <span className="hidden sm:inline">
            Hover the field for a quick checklist tooltip.
          </span>
        </p>
        <span
          className={`tabular-nums shrink-0 ${
            !ok && len > 0 ? "text-persona-scale" : "text-ink-400"
          }`}
          aria-live="polite"
        >
          {len.toLocaleString()} / {PASTE_MAX_CHARS.toLocaleString()}
          {len < PASTE_MIN_CHARS && len > 0 ? (
            <span className="block text-persona-scale">
              Min {PASTE_MIN_CHARS} characters
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
