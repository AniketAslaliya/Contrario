import type { AnalysisRow } from "@/lib/analysis-store";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { extractKeyConcernFromMarkdown, extractScoreFromMarkdown } from "@/lib/parse-persona-output";
import type { RedFlagRow, SynthesisPayload } from "@/lib/synthesis/post-analysis";

export type PersonaScoreMap = Record<PersonaId, number | null>;

export type DeckCompareResult = {
  v1: AnalysisRow;
  v2: AnalysisRow;
  scoresV1: PersonaScoreMap;
  scoresV2: PersonaScoreMap;
  delta: Record<PersonaId, number | null>;
  mostImprovedPersona: PersonaId | null;
  keyConcernV1: Record<PersonaId, string>;
  keyConcernV2: Record<PersonaId, string>;
  newRedFlags: RedFlagRow[];
  resolvedRedFlags: RedFlagRow[];
};

function parseScore(text: string): number | null {
  const s = extractScoreFromMarkdown(text);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function scoreMaps(outputs: AnalysisRow["persona_outputs"]): PersonaScoreMap {
  const m: PersonaScoreMap = {
    "scale-chaser": null,
    "conviction-buyer": null,
    "reality-check": null,
  };
  for (const id of PERSONA_IDS) {
    m[id] = parseScore(outputs[id] ?? "");
  }
  return m;
}

function normalizeIssue(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function diffRedFlags(
  prev: SynthesisPayload | null,
  next: SynthesisPayload | null
): { newFlags: RedFlagRow[]; resolved: RedFlagRow[] } {
  const prevFlags = prev?.redFlags ?? [];
  const nextFlags = next?.redFlags ?? [];
  const prevSet = new Set(prevFlags.map((f) => normalizeIssue(f.issue)));
  const nextSet = new Set(nextFlags.map((f) => normalizeIssue(f.issue)));

  const newFlags = nextFlags.filter(
    (f) => !prevSet.has(normalizeIssue(f.issue))
  );
  const resolved = prevFlags.filter(
    (f) => !nextSet.has(normalizeIssue(f.issue))
  );
  return { newFlags, resolved };
}

/** Compare two saved analyses (v1 = baseline, v2 = revision). */
export function compareDeckAnalyses(
  v1: AnalysisRow,
  v2: AnalysisRow
): DeckCompareResult {
  const scoresV1 = scoreMaps(v1.persona_outputs);
  const scoresV2 = scoreMaps(v2.persona_outputs);

  const delta: Record<PersonaId, number | null> = {
    "scale-chaser": null,
    "conviction-buyer": null,
    "reality-check": null,
  };

  let bestDelta = -Infinity;
  let mostImproved: PersonaId | null = null;

  for (const id of PERSONA_IDS) {
    const a = scoresV1[id];
    const b = scoresV2[id];
    if (a == null || b == null) {
      delta[id] = null;
      continue;
    }
    const d = Math.round((b - a) * 10) / 10;
    delta[id] = d;
    if (d > bestDelta) {
      bestDelta = d;
      mostImproved = id;
    }
  }

  if (bestDelta <= 0) {
    mostImproved = null;
  }

  const keyConcernV1 = {} as Record<PersonaId, string>;
  const keyConcernV2 = {} as Record<PersonaId, string>;
  for (const id of PERSONA_IDS) {
    keyConcernV1[id] = extractKeyConcernFromMarkdown(
      v1.persona_outputs[id] ?? ""
    );
    keyConcernV2[id] = extractKeyConcernFromMarkdown(
      v2.persona_outputs[id] ?? ""
    );
  }

  const { newFlags, resolved } = diffRedFlags(
    v1.synthesis,
    v2.synthesis
  );

  return {
    v1,
    v2,
    scoresV1,
    scoresV2,
    delta,
    mostImprovedPersona: mostImproved,
    keyConcernV1,
    keyConcernV2,
    newRedFlags: newFlags,
    resolvedRedFlags: resolved,
  };
}
