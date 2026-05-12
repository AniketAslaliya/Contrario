import { GoogleGenerativeAI } from "@google/generative-ai";

/** Default free-tier friendly; override with GEMINI_MODEL in .env.local */
export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

export function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(key);
}

export function getGeminiGenerativeModel(
  modelId?: string,
  systemInstruction?: string
) {
  return getGeminiClient().getGenerativeModel({
    model: modelId || DEFAULT_GEMINI_MODEL,
    ...(systemInstruction
      ? { systemInstruction }
      : {}),
  });
}
