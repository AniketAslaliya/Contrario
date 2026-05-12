"use client";

import type { PersonaId } from "@/lib/personas";
import { displayNameForPersona } from "@/lib/personas";

const accent: Record<PersonaId, string> = {
  "scale-chaser": "border-l-persona-scale",
  "conviction-buyer": "border-l-persona-conviction",
  "reality-check": "border-l-persona-reality",
};

type Props = {
  id: PersonaId;
  text: string;
  streaming: boolean;
  error?: string | null;
};

export function PersonaStreamColumn({ id, text, streaming, error }: Props) {
  return (
    <div
      className={`rounded-2xl border border-cream-400 bg-cream-100/70 p-4 text-left border-l-4 ${accent[id]}`}
    >
      <h3 className="font-serif text-xl text-ink mb-2 tracking-tight">
        {displayNameForPersona(id)}
      </h3>
      {error ? (
        <p className="text-sm text-persona-scale">{error}</p>
      ) : (
        <div className="prose prose-sm max-w-none text-ink-600">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-600 bg-transparent p-0 m-0">
            {text || (streaming ? "…" : "—")}
          </pre>
        </div>
      )}
    </div>
  );
}
