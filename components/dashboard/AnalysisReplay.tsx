"use client";

import Link from "next/link";
import type { AnalysisRow } from "@/lib/analysis-store";
import { ConflictMap } from "@/components/conflict-map/ConflictMap";
import { RedFlagsSummary } from "@/components/RedFlagsSummary";
import { PersonaStreamColumn } from "@/components/persona-card/PersonaStreamColumn";
import { ShareReportTools } from "@/components/dashboard/ShareReportTools";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { extractScoreFromMarkdown } from "@/lib/parse-persona-output";

type Props = {
  analysis: AnalysisRow;
  /** Share panel on authenticated detail view. */
  showShare?: boolean;
  /** Hide account nav — public /r/[slug] view. */
  publicView?: boolean;
};

export function AnalysisReplay({ analysis, showShare, publicView }: Props) {
  const scores: Record<PersonaId, string | null> = {
    "scale-chaser": null,
    "conviction-buyer": null,
    "reality-check": null,
  };
  for (const id of PERSONA_IDS) {
    scores[id] = extractScoreFromMarkdown(analysis.persona_outputs[id] ?? "");
  }

  const created = new Date(analysis.created_at);

  return (
    <div className="w-full max-w-6xl mx-auto px-0 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Link
            href={publicView ? "/" : "/dashboard"}
            className="text-xs text-ink-400 hover:text-ink mb-2 inline-block"
          >
            {publicView ? "← Contrario" : "← Analysis history"}
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-ink tracking-tight">
            {analysis.title}
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            {created.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {analysis.avg_score != null ? (
              <>
                {" "}
                · Avg score{" "}
                <span className="text-ink font-medium tabular-nums">
                  {analysis.avg_score}/10
                </span>
              </>
            ) : null}
            {" · "}
            <span className="capitalize">{analysis.source}</span>
          </p>
        </div>
      </div>

      {showShare && !publicView ? (
        <div className="mb-8 max-w-xl mx-auto">
          <ShareReportTools analysisId={analysis.id} />
        </div>
      ) : null}

      {analysis.input_preview ? (
        <section className="mb-10 rounded-2xl border border-cream-400 bg-cream-100/50 p-4 md:p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-2">
            Pitch excerpt
          </p>
          <p className="text-sm text-ink-600 whitespace-pre-wrap leading-relaxed">
            {analysis.input_preview}
            {analysis.input_preview.length >= 1990 ? "…" : ""}
          </p>
        </section>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {PERSONA_IDS.map((id) => (
          <PersonaStreamColumn
            key={id}
            id={id}
            text={analysis.persona_outputs[id] ?? ""}
            streaming={false}
            error={null}
            score={scores[id]}
          />
        ))}
      </div>

      {analysis.synthesis ? (
        <>
          <ConflictMap data={analysis.synthesis.conflictMap} visible />
          <RedFlagsSummary flags={analysis.synthesis.redFlags} visible />
        </>
      ) : null}
    </div>
  );
}
