"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  synthesis: string;
};

/**
 * Conflict map — matches global warm-cream + ink theme (same language as persona cards).
 * Readable body copy: ink on cream, serif headings, persona-scale accent — no light-on-pastel.
 */
export function ConflictMap({ synthesis }: Props) {
  if (!synthesis.trim()) return null;

  return (
    <div className="mt-10 rounded-[1.25rem] border border-cream-400 border-l-4 border-l-persona-scale bg-cream-100/90 shadow-[0_12px_40px_-20px_rgba(26,26,26,0.08)]">
      <div className="px-6 py-6 md:px-8 md:py-8">
        <div className="flex items-start gap-3 mb-6">
          <span
            className="mt-0.5 text-persona-scale text-lg leading-none font-serif"
            aria-hidden
          >
            ⚠
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 font-sans mb-1">
              Consensus
            </p>
            <h3 className="font-serif text-2xl md:text-[1.65rem] text-ink tracking-tight leading-snug">
              Where all three agree — critical fixes
            </h3>
          </div>
        </div>
        <div
          className="prose prose-sm max-w-none font-sans
            text-ink
            [&_h2]:font-serif [&_h2]:text-ink [&_h2]:text-xl [&_h2]:font-normal [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:first:mt-0
            [&_h3]:font-serif [&_h3]:text-ink [&_h3]:text-lg [&_h3]:font-normal [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-ink-600 [&_p]:leading-relaxed
            [&_li]:text-ink-600 [&_li]:marker:text-persona-scale
            [&_ul]:my-3 [&_ol]:my-3
            [&_strong]:text-ink [&_strong]:font-semibold
            [&_a]:text-persona-scale [&_a]:underline-offset-2 [&_a]:hover:text-ink"
        >
          <ReactMarkdown>{synthesis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
