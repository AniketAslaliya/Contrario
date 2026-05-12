import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";

/** Pull 1–10 score from persona markdown (## Score section). */
export function extractScoreFromMarkdown(md: string): string | null {
  const m = md.match(/##\s*Score\s*\n+\s*(\d{1,2})\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return String(n);
}

/** Mean of available persona scores (1–10); null if none parsed. */
export function averageScoreFromOutputs(
  outputs: Record<PersonaId, string>
): number | null {
  const vals: number[] = [];
  for (const id of PERSONA_IDS) {
    const s = extractScoreFromMarkdown(outputs[id] ?? "");
    if (s !== null) vals.push(Number(s));
  }
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}
