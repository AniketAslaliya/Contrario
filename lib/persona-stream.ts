import { getAnthropicClient, DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropic";
import { getGeminiGenerativeModel } from "@/lib/gemini";
import { getAiBackend } from "@/lib/ai-provider";
import {
  buildUserPromptForPitch,
  getPersonaSystemPromptWithSlides,
  type PersonaId,
} from "@/lib/personas";
import type { PitchSlide } from "@/lib/slide-split";

export type PersonaStreamOptions = {
  slides?: PitchSlide[] | null;
  /** M20 India context mode */
  indiaContext?: boolean;
};

async function* streamGeminiPersona(
  id: PersonaId,
  pitch: string,
  opts?: PersonaStreamOptions
): AsyncGenerator<string> {
  const withSlides = Boolean(opts?.slides && opts.slides.length >= 2);
  const india = Boolean(opts?.indiaContext);
  const sys = getPersonaSystemPromptWithSlides(id, withSlides, india);
  const model = getGeminiGenerativeModel(undefined, sys);
  const prompt = buildUserPromptForPitch(pitch, {
    slides: withSlides ? opts!.slides : undefined,
  });

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
  pitch: string,
  opts?: PersonaStreamOptions
): AsyncGenerator<string> {
  const withSlides = Boolean(opts?.slides && opts.slides.length >= 2);
  const india = Boolean(opts?.indiaContext);
  const client = getAnthropicClient();
  const stream = client.messages.stream({
    model: DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 8192,
    system: getPersonaSystemPromptWithSlides(id, withSlides, india),
    messages: [
      {
        role: "user",
        content: buildUserPromptForPitch(pitch, {
          slides: withSlides ? opts!.slides : undefined,
        }),
      },
    ],
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
  pitch: string,
  opts?: PersonaStreamOptions
): AsyncGenerator<string> {
  const backend = getAiBackend();
  if (backend === "gemini") {
    yield* streamGeminiPersona(id, pitch, opts);
  } else {
    yield* streamAnthropicPersona(id, pitch, opts);
  }
}
