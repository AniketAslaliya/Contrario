import { GoogleGenerativeAI } from "@google/generative-ai";

export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

export function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/** Optional helper — uses default model + optional system instruction string. */
export function getGeminiGenerativeModel(
  modelId?: string,
  systemInstruction?: string
) {
  return getGeminiClient().getGenerativeModel({
    model: modelId || DEFAULT_GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}
