/**
 * Which LLM powers analysis when using `lib/persona-stream.ts` and other shared helpers.
 * For `/api/analyze`, the stream is **Gemini-only** via `lib/analyze-sse.ts` (requires GEMINI_API_KEY).
 * Server-only — do not import from client components.
 */

export type AiBackend = "gemini" | "anthropic";

/** Prefer Gemini when explicitly set, or when only GEMINI_API_KEY is present (free-tier demo). */
export function getAiBackend(): AiBackend {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "anthropic" || raw === "claude") return "anthropic";
  if (raw === "gemini" || raw === "google") return "gemini";

  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  if (hasGemini && !hasAnthropic) return "gemini";
  if (!hasGemini && hasAnthropic) return "anthropic";
  if (hasGemini) return "gemini";
  return "anthropic";
}

export function assertActiveLlmConfigured(): void {
  const b = getAiBackend();
  if (b === "gemini") {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      throw new Error("GEMINI_API_KEY is required when AI_PROVIDER is gemini.");
    }
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new Error(
      "ANTHROPIC_API_KEY is required when using Anthropic, or set AI_PROVIDER=gemini + GEMINI_API_KEY."
    );
  }
}

/** `/api/analyze` uses Gemini-only streaming — requires Google AI Studio key. */
export function assertGeminiConfiguredForAnalyze(): void {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error(
      "GEMINI_API_KEY is required for analysis (Gemini 2.5 Flash streaming)."
    );
  }
}
