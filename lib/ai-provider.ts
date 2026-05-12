/**
 * Which LLM powers M06+ analysis. Default `gemini` for free-tier dev;
 * set `AI_PROVIDER=anthropic` (or `claude`) for Claude.
 * Server-only — do not import from client components.
 */

export type AiBackend = "gemini" | "anthropic";

export function getAiBackend(): AiBackend {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "anthropic" || raw === "claude") return "anthropic";
  return "gemini";
}

export function assertActiveLlmConfigured(): void {
  const b = getAiBackend();
  if (b === "gemini") {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      throw new Error("GEMINI_API_KEY is required when AI_PROVIDER is gemini (default).");
    }
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER is anthropic.");
  }
}
