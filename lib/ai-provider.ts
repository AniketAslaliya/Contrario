/**
 * Which LLM powers analysis (M06+).
 * Default: **Anthropic** — set **AI_PROVIDER=gemini** and **GEMINI_API_KEY** to use Gemini.
 * Server-only — do not import from client components.
 */

export type AiBackend = "gemini" | "anthropic";

export function getAiBackend(): AiBackend {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "gemini" || raw === "google") return "gemini";
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
      "ANTHROPIC_API_KEY is required (default backend is Anthropic; set AI_PROVIDER=gemini for Gemini)."
    );
  }
}
