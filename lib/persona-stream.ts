import { getAnthropicClient, DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropic";
import { getGeminiGenerativeModel } from "@/lib/gemini";
import { getAiBackend } from "@/lib/ai-provider";
import {
  buildUserPromptForPitch,
  getPersonaSystemPrompt,
  type PersonaId,
} from "@/lib/personas";

async function* streamGeminiPersona(
  id: PersonaId,
  pitch: string
): AsyncGenerator<string> {
  const sys = getPersonaSystemPrompt(id);
  const model = getGeminiGenerativeModel(undefined, sys);
  const prompt = buildUserPromptForPitch(pitch);

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}

async function* streamAnthropicPersona(
  id: PersonaId,
  pitch: string
): AsyncGenerator<string> {
  const client = getAnthropicClient();
  const stream = client.messages.stream({
    model: DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: getPersonaSystemPrompt(id),
    messages: [{ role: "user", content: buildUserPromptForPitch(pitch) }],
  });

  const queue: string[] = [];
  let done = false;
  let err: Error | null = null;
  let wake: (() => void) | null = null;

  const bump = () => wake?.();

  stream.on("text", (delta: string) => {
    queue.push(delta);
    bump();
  });
  stream.on("end", () => {
    done = true;
    bump();
  });
  stream.on("error", (e: unknown) => {
    err = e instanceof Error ? e : new Error(String(e));
    done = true;
    bump();
  });

  while (!done || queue.length > 0) {
    if (queue.length > 0) {
      yield queue.shift()!;
    } else if (!done) {
      await new Promise<void>((r) => {
        wake = r;
      });
    }
    if (err) throw err;
  }
}

/** Parallel consumers await three independent generators created from this factory. */
export async function* streamPersonaText(
  id: PersonaId,
  pitch: string
): AsyncGenerator<string> {
  const backend = getAiBackend();
  if (backend === "gemini") {
    yield* streamGeminiPersona(id, pitch);
  } else {
    yield* streamAnthropicPersona(id, pitch);
  }
}
