"use client";

import Link from "next/link";
import type { AnalysisRow } from "@/lib/analysis-store";
import { synthesisPayloadToMarkdown } from "@/lib/synthesis/format-synthesis-markdown";
import { ConflictMap } from "@/components/conflict-map/ConflictMap";
import { RedFlagsSummary } from "@/components/RedFlagsSummary";
import { PersonaStreamColumn } from "@/components/persona-card/PersonaStreamColumn";
import { ShareReportTools } from "@/components/dashboard/ShareReportTools";
import { MemoGeneratorButton } from "@/components/dashboard/MemoGeneratorButton";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { extractScoreFromMarkdown } from "@/lib/parse-persona-output";

type Props = {
  analysis: AnalysisRow;
  /** Share panel on authenticated detail view. */
  showShare?: boolean;
  /** Hide account nav — public /r/[slug] view. */
  publicView?: boolean;
  /** M18 — 60s read: summary only, no persona columns. */
  triageMode?: boolean;
  /** Show server-PDF download (signed-in analysis detail). */
  showPdfDownload?: boolean;
  showTriageLink?: boolean;
  showMemoButton?: boolean;
};

function triageSignal(avg: number | null): string {
  if (avg == null) return "—";
  if (avg >= 7) return "Lean in";
  if (avg >= 5) return "Review carefully";
  return "Likely pass";
}

export function AnalysisReplay({
  analysis,
  showShare,
  publicView,
  triageMode,
  showPdfDownload,
  showTriageLink,
  showMemoButton,
}: Props) {
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

      {showMemoButton && !publicView ? (
        <MemoGeneratorButton analysisId={analysis.id} />
      ) : null}

      {(showPdfDownload || showTriageLink) && !publicView ? (
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {showPdfDownload ? (
            <a
              href={`/api/analyses/${analysis.id}/pdf`}
              className="btn-secondary !py-2.5 !text-sm inline-block text-center"
            >
              Download PDF
            </a>
          ) : null}
          {showTriageLink ? (
            <Link
              href={`/dashboard/analysis/${analysis.id}/triage`}
              className="btn-secondary !py-2.5 !text-sm inline-block text-center"
            >
              Quick triage
            </Link>
          ) : null}
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

      {triageMode ? (
        <section className="mb-10 rounded-2xl border border-cream-400 bg-cream-100/60 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-4">
            Quick triage
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div>
              <p className="text-sm text-ink-500 mb-1">Signal</p>
              <p className="font-serif text-3xl text-ink">
                {triageSignal(analysis.avg_score)}
              </p>
            </div>
            {analysis.avg_score != null ? (
              <div className="rounded-full bg-ink text-cream-100 text-sm font-medium px-4 py-2 w-fit tabular-nums">
                Composite {analysis.avg_score}/10
              </div>
            ) : null}
          </div>
          {analysis.synthesis ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-2">
                  Top positives (consensus)
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-ink-700">
                  {analysis.synthesis.conflictMap.green.slice(0, 3).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-2">
                  Top concerns
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-ink-700">
                  {(analysis.synthesis.redFlags.length
                    ? analysis.synthesis.redFlags.map((r) => r.issue)
                    : analysis.synthesis.conflictMap.red.slice(0, 3)
                  )
                    .slice(0, 3)
                    .map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-500">No synthesis snapshot stored.</p>
          )}
        </section>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {PERSONA_IDS.map((id) => (
            <PersonaStreamColumn
              key={id}
              id={id}
              text={analysis.persona_outputs[id] ?? ""}
              status="done"
              error={null}
              score={scores[id]}
            />
          ))}
        </div>
      )}

      {!triageMode && analysis.synthesis ? (
        <>
          <ConflictMap
            synthesis={synthesisPayloadToMarkdown(analysis.synthesis)}
          />
          <RedFlagsSummary flags={analysis.synthesis.redFlags} visible />
        </>
      ) : null}
    </div>
  );
}
