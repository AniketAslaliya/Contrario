import { getGeminiClient, DEFAULT_GEMINI_MODEL } from "@/lib/gemini";
import {
  buildUserPromptForPitch,
  getPersonaSystemPromptWithSlides,
  PERSONA_IDS,
  type PersonaId,
} from "@/lib/personas";
import type { PitchSlide } from "@/lib/slide-split";

export function parseSlidesPayload(body: unknown): PitchSlide[] | null {
  const slides = (body as { slides?: unknown }).slides;
  if (!Array.isArray(slides) || slides.length < 2) return null;
  const out: PitchSlide[] = [];
  for (const item of slides.slice(0, 40)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const index = Number(o.index);
    const title = String(o.title ?? "Slide");
    const content = String(o.content ?? "").trim();
    if (!Number.isFinite(index) || index < 1) continue;
    if (content.length < 20) continue;
    out.push({
      index,
      title: title.slice(0, 120),
      content: content.slice(0, 50_000),
    });
  }
  return out.length >= 2 ? out : null;
}

/**
 * SSE pipeline: 3 personas via Gemini Flash streaming in parallel, then one synthesis call.
 * Events: `{ persona, delta }`, `{ persona, done: true }`, `{ synthesis: string }`,
 * `{ synthesisError }`, `{ finished: true }`.
 */
export function buildAnalyzeSseStream(params: {
  text: string;
  slidesForStream: PitchSlide[] | null;
  indiaContext: boolean;
}): ReadableStream<Uint8Array> {
  const { text, slidesForStream, indiaContext } = params;
  const encoder = new TextEncoder();

  const send = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    data: object
  ) => {
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  };

  return new ReadableStream({
    async start(controller) {
      /** First byte ASAP — avoids idle proxies buffering until Gemini returns, proves the route is alive. */
      send(controller, { streamReady: true });

      let genAI: ReturnType<typeof getGeminiClient>;
      try {
        genAI = getGeminiClient();
      } catch (e) {
        send(controller, {
          fatal: true,
          error: e instanceof Error ? e.message : "Gemini client error",
        });
        send(controller, { finished: true });
        controller.close();
        return;
      }

      const hasSlides = Boolean(
        slidesForStream && slidesForStream.length >= 2
      );
      const userPrompt = buildUserPromptForPitch(text, {
        slides: hasSlides ? slidesForStream : undefined,
      });

      const personaOutputs: Record<PersonaId, string> = {
        "scale-chaser": "",
        "conviction-buyer": "",
        "reality-check": "",
      };

      try {
        await Promise.allSettled(
          PERSONA_IDS.map(async (personaId) => {
          try {
            const systemPrompt = getPersonaSystemPromptWithSlides(
              personaId,
              hasSlides,
              indiaContext
            );

            const model = genAI.getGenerativeModel({
              model: DEFAULT_GEMINI_MODEL,
              systemInstruction: systemPrompt,
            });

            const result = await model.generateContentStream({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            });

            send(controller, { persona: personaId, status: "streaming" });

            for await (const chunk of result.stream) {
              const delta = chunk.text();
              if (delta) {
                personaOutputs[personaId] += delta;
                send(controller, { persona: personaId, delta });
              }
            }

            send(controller, { persona: personaId, done: true });
          } catch (err) {
            send(controller, {
              persona: personaId,
              error: err instanceof Error ? err.message : "Persona failed",
              done: true,
            });
          }
          })
        );
      } catch (e) {
        send(controller, {
          fatal: true,
          error: e instanceof Error ? e.message : "Persona streams failed",
        });
      }

      try {
        const synthesisPrompt = `
You are a synthesis engine. Three investors have reviewed a pitch deck.
Here are their full responses:

SCALE CHASER:
${personaOutputs["scale-chaser"]}

CONVICTION BUYER:
${personaOutputs["conviction-buyer"]}

REALITY CHECK:
${personaOutputs["reality-check"]}

Your job: identify ONLY the issues ALL THREE flagged. Return EXACTLY this markdown:

## Critical consensus (all 3 agree)
- [issue 1 — one sentence, be specific]
- [issue 2]
- [issue 3 — max 3 items]

## Where they diverge
One short sentence per disagreement. Max 2.

Be brutally concise. No preamble. No repetition.
`.trim();

        const synthModel = genAI.getGenerativeModel({
          model: DEFAULT_GEMINI_MODEL,
        });
        const synthResult = await synthModel.generateContent(synthesisPrompt);
        const synthesis = synthResult.response.text();
        send(controller, { synthesis });
      } catch {
        send(controller, { synthesisError: "Conflict map generation failed" });
      }

      send(controller, { finished: true });
      controller.close();
    },
  });
}
