/** Pull 1–10 score from persona markdown (## Score section). */
export function extractScoreFromMarkdown(md: string): string | null {
  const m = md.match(/##\s*Score\s*\n+\s*(\d{1,2})\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return String(n);
}
