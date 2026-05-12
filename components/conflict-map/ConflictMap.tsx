"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  synthesis: string;
};

/** Renders post-analysis synthesis as markdown (conflict zones + consensus issues). */
export function ConflictMap({ synthesis }: Props) {
  if (!synthesis.trim()) return null;

  return (
    <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-950/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-red-400 text-lg" aria-hidden>
          ⚠
        </span>
        <h3 className="font-semibold text-red-300 text-sm uppercase tracking-widest">
          Where all three agree — critical fixes
        </h3>
      </div>
      <div className="prose prose-stone prose-sm max-w-none text-red-100/80 [&_h3]:text-red-200/90 [&_h4]:text-red-200/80 [&_strong]:text-red-100">
        <ReactMarkdown>{synthesis}</ReactMarkdown>
      </div>
    </div>
  );
}
