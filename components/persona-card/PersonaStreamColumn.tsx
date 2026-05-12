"use client";

import type { PersonaId } from "@/lib/personas";
import { displayNameForPersona } from "@/lib/personas";
import ReactMarkdown from "react-markdown";

const accent: Record<PersonaId, string> = {
  "scale-chaser": "border-l-persona-scale",
  "conviction-buyer": "border-l-persona-conviction",
  "reality-check": "border-l-persona-reality",
};

export type PersonaStreamStatus = "idle" | "streaming" | "done";

type Props = {
  id: PersonaId;
  text: string;
  status: PersonaStreamStatus;
  error?: string | null;
  score?: string | null;
};

export function PersonaStreamColumn({
  id,
  text,
  status,
  error,
  score,
}: Props) {
  const show = text.trim().length > 0;
  const showCursor = status === "streaming";

  return (
    <div
      className={`rounded-2xl border border-cream-400 bg-cream-100/70 p-4 text-left border-l-4 ${accent[id]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif text-xl text-ink tracking-tight">
          {displayNameForPersona(id)}
        </h3>
        {score ? (
          <span className="shrink-0 rounded-full bg-ink text-cream-100 text-xs font-medium px-2.5 py-1 tabular-nums">
            {score}/10
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-persona-scale">{error}</p>
      ) : (
        <div className="prose prose-stone prose-sm max-w-none text-ink-700 leading-relaxed">
          {show ? (
            <>
              <ReactMarkdown>{text}</ReactMarkdown>
              {showCursor ? (
                <span
                  className="inline-block w-1.5 h-4 bg-ink-600 opacity-70 animate-pulse ml-0.5 align-middle"
                  aria-hidden
                />
              ) : null}
            </>
          ) : (
            <p className="text-[13px] m-0 text-ink-500">
              {status === "streaming" ? (
                <span className="inline-block w-1.5 h-4 bg-ink-500 opacity-70 animate-pulse align-middle" />
              ) : (
                "—"
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
