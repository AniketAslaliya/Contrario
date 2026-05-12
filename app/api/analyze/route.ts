import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assertActiveLlmConfigured } from "@/lib/ai-provider";
import {
  ANALYSIS_INPUT_MAX_CHARS,
  ANALYSIS_INPUT_MIN_CHARS,
} from "@/lib/analyze-input";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { streamPersonaText } from "@/lib/persona-stream";
import { synthesizeConflictAndFlags } from "@/lib/synthesis/post-analysis";
import type { PitchSlide } from "@/lib/slide-split";

export const runtime = "nodejs";
export const maxDuration = 300;

function parseSlidesPayload(body: unknown): PitchSlide[] | null {
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
 * SSE stream events:
 * - `{ persona, delta }` — token deltas
 * - `{ persona, done: true }` — persona stream complete
 * - `{ synthesis }` — M07/M08 conflict map + red flags (after all personas)
 * - `{ synthesisError }` — JSON synthesis failed (persona text still returned)
 * - `{ finished: true }` — end of response
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text =
    typeof (body as { text?: unknown }).text === "string"
      ? (body as { text: string }).text.trim()
      : "";

  const slidesForStream = parseSlidesPayload(body);
  if (text.length < ANALYSIS_INPUT_MIN_CHARS) {
    return Response.json(
      { error: `Pitch text must be at least ${ANALYSIS_INPUT_MIN_CHARS} characters.` },
      { status: 400 }
    );
  }
  if (text.length > ANALYSIS_INPUT_MAX_CHARS) {
    return Response.json(
      { error: `Pitch text exceeds ${ANALYSIS_INPUT_MAX_CHARS.toLocaleString()} characters.` },
      { status: 413 }
    );
  }

  try {
    assertActiveLlmConfigured();
  } catch (e) {
    return Response.json(
      {
        error: e instanceof Error ? e.message : "LLM not configured",
      },
      { status: 503 }
    );
  }

  await getServerSession(authOptions);

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

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      await Promise.all(
        PERSONA_IDS.map((id) =>
          (async () => {
            try {
              for await (const delta of streamPersonaText(id, text, {
                slides: slidesForStream ?? undefined,
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
