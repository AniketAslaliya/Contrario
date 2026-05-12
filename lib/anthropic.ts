import Anthropic from "@anthropic-ai/sdk";

/** Model ID from env or PRD default (swap via ANTHROPIC_MODEL). */
export const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: key });
}
