import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { getAiBackend } from "@/lib/ai-provider";
import { getGeminiGenerativeModel } from "@/lib/gemini";
import { getAnthropicClient, DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropic";

export type ConflictMapData = {
  /** Strengths all three personas agree on */
  green: string[];
  /** Critical gaps all three flag */
  red: string[];
  /** Mixed / 2-of-3 signals */
  yellow: string[];
};

export type RedFlagRow = { issue: string; fix: string };

export type SynthesisPayload = {
  conflictMap: ConflictMapData;
  redFlags: RedFlagRow[];
};

const JSON_INSTRUCTION = `Return ONLY a JSON object (no markdown) with exactly this shape:
{"conflictMap":{"green":["string"],"red":["string"],"yellow":["string"]},"redFlags":[{"issue":"string","fix":"string"}]}
Rules:
- conflictMap.green: up to 5 bullets where all three narratives clearly align on a strength.
- conflictMap.red: up to 5 bullets where all three agree something is a serious problem.
- conflictMap.yellow: up to 5 bullets for 2-vs-1 dynamics or ambiguous disagreement.
- redFlags: 0 to 3 rows — consensus flaws that ALL THREE touch; "fix" is one actionable line each.
Keep bullets under 200 characters.`;

function packOutputs(outputs: Record<PersonaId, string>): string {
  const parts: string[] = [];
  for (const id of PERSONA_IDS) {
    parts.push(`## ${id}\n\n${outputs[id] ?? ""}`.trimEnd());
  }
  return parts.join("\n\n---\n\n");
}

function normalizePayload(raw: unknown): SynthesisPayload {
  const j = raw as Record<string, unknown>;
  const cm = (j.conflictMap ?? {}) as Record<string, unknown>;
  const green = Array.isArray(cm.green)
    ? cm.green.map((x) => String(x).trim()).filter(Boolean).slice(0, 5)
    : [];
  const red = Array.isArray(cm.red)
    ? cm.red.map((x) => String(x).trim()).filter(Boolean).slice(0, 5)
    : [];
  const yellow = Array.isArray(cm.yellow)
    ? cm.yellow.map((x) => String(x).trim()).filter(Boolean).slice(0, 5)
    : [];
  const rfIn = Array.isArray(j.redFlags) ? j.redFlags : [];
  const redFlags = rfIn
    .slice(0, 3)
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        issue: String(r.issue ?? "").trim(),
        fix: String(r.fix ?? "").trim(),
      };
    })
    .filter((r) => r.issue.length > 0);
  return {
    conflictMap: { green, red, yellow },
    redFlags,
  };
}

/**
 * Second-pass call after all three persona streams finish — not parallel with them,
 * but uses the active LLM configured for M06.
 */
export async function synthesizeConflictAndFlags(
  outputs: Record<PersonaId, string>
): Promise<SynthesisPayload> {
  const body = packOutputs(outputs);
  const userBlock = `${JSON_INSTRUCTION}\n\n# Three persona analyses\n\n${body}`;

  const backend = getAiBackend();
  let textOut: string;

  if (backend === "gemini") {
    const model = getGeminiGenerativeModel(
      undefined,
      "You are a venture analyst who compares three investor write-ups and outputs strict JSON only."
    );
    const r = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userBlock }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    textOut = r.response.text();
  } else {
    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 4096,
      system:
        "You are a venture analyst who compares three investor write-ups. " +
        JSON_INSTRUCTION,
      messages: [{ role: "user", content: userBlock }],
    });
    const block = msg.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected Claude response block");
    }
    textOut = block.text;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textOut);
  } catch {
    throw new Error("Synthesis model did not return valid JSON");
  }
  return normalizePayload(parsed);
}
