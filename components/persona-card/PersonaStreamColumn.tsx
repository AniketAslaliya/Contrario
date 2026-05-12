"use client";

import { motion } from "framer-motion";
import { Scale, Sparkles, TrendingUp } from "lucide-react";
import type { PersonaId } from "@/lib/personas";
import { displayNameForPersona, personaTagline } from "@/lib/personas";
import ReactMarkdown from "react-markdown";

const Icon = {
  "scale-chaser": TrendingUp,
  "conviction-buyer": Sparkles,
  "reality-check": Scale,
} as const;

const orbClass: Record<PersonaId, string> = {
  "scale-chaser":
    "bg-gradient-to-br from-persona-scale/35 to-persona-scale/10 ring-2 ring-persona-scale/35 text-persona-scale",
  "conviction-buyer":
    "bg-gradient-to-br from-persona-conviction/35 to-persona-conviction/10 ring-2 ring-persona-conviction/35 text-persona-conviction",
  "reality-check":
    "bg-gradient-to-br from-persona-reality/35 to-persona-reality/10 ring-2 ring-persona-reality/35 text-persona-reality",
};

const streamRing: Record<PersonaId, string> = {
  "scale-chaser": "ring-persona-scale/45",
  "conviction-buyer": "ring-persona-conviction/45",
  "reality-check": "ring-persona-reality/45",
};

const stripeClass: Record<PersonaId, string> = {
  "scale-chaser": "from-persona-scale via-persona-scale/80 to-persona-conviction/30",
  "conviction-buyer":
    "from-persona-conviction via-persona-conviction/80 to-persona-reality/30",
  "reality-check":
    "from-persona-reality via-persona-reality/80 to-persona-scale/20",
};

export type PersonaStreamStatus = "idle" | "streaming" | "done";

type Props = {
  id: PersonaId;
  text: string;
  status: PersonaStreamStatus;
  error?: string | null;
  score?: string | null;
  /** Staggered entrance on the analyze grid */
  columnIndex?: number;
};

export function PersonaStreamColumn({
  id,
  text,
  status,
  error,
  score,
  columnIndex = 0,
}: Props) {
  const show = text.trim().length > 0;
  const showCursor = status === "streaming";
  const Gi = Icon[id];
  const isLive = status === "streaming";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: columnIndex * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative flex flex-col overflow-hidden rounded-[1.35rem] border border-cream-400/90 bg-gradient-to-b from-cream-100 to-cream-100/70 text-left shadow-[0_20px_50px_-28px_rgba(26,26,26,0.18)] transition-shadow duration-300 hover:shadow-[0_24px_56px_-24px_rgba(26,26,26,0.22)] ${
        isLive
          ? `ring-2 ring-offset-[3px] ring-offset-cream-100 ${streamRing[id]}`
          : ""
      }`}
    >
      <div
        className={`h-1 w-full bg-gradient-to-r ${stripeClass[id]} opacity-90`}
        aria-hidden
      />

      <div className="p-5 pt-4">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ${orbClass[id]}`}
          >
            <Gi className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-serif text-[1.35rem] leading-tight text-ink tracking-tight">
              {displayNameForPersona(id)}
            </h3>
            <p className="mt-1 text-[11px] font-sans uppercase tracking-[0.14em] text-ink-400">
              {personaTagline(id)}
            </p>
          </div>
          {score ? (
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums shadow-sm bg-ink text-cream-100 ring-2 ring-cream-400/60`}
            >
              {score}
              <span className="text-cream-300/90 font-normal">/10</span>
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-persona-scale/25 bg-persona-scale/5 px-4 py-3 text-sm text-persona-scale leading-relaxed">
            {error}
          </p>
        ) : (
          <div
            className={`relative overflow-hidden rounded-xl border border-ink/10 bg-ink/[0.88] px-3.5 py-3.5 text-cream-100 grainy shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-h-[4.5rem]`}
          >
            {isLive && !show ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
            ) : null}
            {show ? (
              <div
                className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-p:leading-relaxed prose-li:marker:text-cream-500 [&_strong]:text-cream-50 [&_h2]:text-lg [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:first:mt-0 [&_ol]:my-3 [&_ul]:my-3"
              >
                <ReactMarkdown>{text}</ReactMarkdown>
                {showCursor ? (
                  <span
                    className="inline-block w-[3px] h-4 rounded-sm bg-current opacity-80 animate-pulse ml-0.5 align-middle shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                    aria-hidden
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed m-0">
                {status === "streaming" ? (
                  <span className="inline-flex items-center gap-2 text-cream-300/90">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-persona-conviction/60 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-persona-conviction" />
                    </span>
                    Reading your deck…
                  </span>
                ) : (
                  <span className="text-cream-400/80">—</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
