import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { streamPersonaText } from "@/lib/persona-stream";
import { synthesizeConflictAndFlags } from "@/lib/synthesis/post-analysis";
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

/** Shared SSE pipeline for /api/analyze and /api/v1/analyze (M25). */
export function buildAnalyzeSseStream(params: {
  text: string;
  slidesForStream: PitchSlide[] | null;
  indiaContext: boolean;
}): ReadableStream<Uint8Array> {
  const { text, slidesForStream, indiaContext } = params;
  const encoder = new TextEncoder();
  let writeSerial = Promise.resolve();

  const safeWrite = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    payload: unknown
  ) => {
    const line = `data: ${JSON.stringify(payload)}\n\n`;
    writeSerial = writeSerial.then(() => {
      controller.enqueue(encoder.encode(line));
    });
    return writeSerial;
  };

  const buffers: Record<PersonaId, string> = {
    "scale-chaser": "",
    "conviction-buyer": "",
    "reality-check": "",
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      await Promise.all(
        PERSONA_IDS.map((id) =>
          (async () => {
            try {
              for await (const delta of streamPersonaText(id, text, {
                slides: slidesForStream ?? undefined,
                indiaContext,
              })) {
                buffers[id] += delta;
                await safeWrite(controller, { persona: id, delta });
              }
              await safeWrite(controller, { persona: id, done: true });
            } catch (e) {
              await safeWrite(controller, {
                persona: id,
                error: e instanceof Error ? e.message : "Stream failed",
              });
            }
          })()
        )
      );
      await writeSerial;

      try {
        const synthesis = await synthesizeConflictAndFlags(buffers);
        await safeWrite(controller, { synthesis });
      } catch (e) {
        await safeWrite(controller, {
          synthesisError:
            e instanceof Error ? e.message : "Conflict map synthesis failed",
        });
      }

      await safeWrite(controller, { finished: true });
      controller.close();
    },
  });
}
