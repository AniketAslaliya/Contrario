import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assertGeminiConfiguredForAnalyze } from "@/lib/ai-provider";
import {
  ANALYSIS_INPUT_MAX_CHARS,
  ANALYSIS_INPUT_MIN_CHARS,
} from "@/lib/analyze-input";
import {
  buildAnalyzeSseStream,
  parseSlidesPayload,
} from "@/lib/analyze-sse";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * SSE stream events:
 * - `{ persona, delta }` — token deltas
 * - `{ persona, done: true }` — persona stream complete
 * - `{ synthesis }` — conflict map (markdown string)
 * - `{ synthesisError }` — synthesis failed
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
  const indiaContext =
    (body as { indiaContext?: unknown }).indiaContext === true;

  if (text.length < ANALYSIS_INPUT_MIN_CHARS) {
    return Response.json(
      {
        error: `Pitch text must be at least ${ANALYSIS_INPUT_MIN_CHARS} characters.`,
      },
      { status: 400 }
    );
  }
  if (text.length > ANALYSIS_INPUT_MAX_CHARS) {
    return Response.json(
      {
        error: `Pitch text exceeds ${ANALYSIS_INPUT_MAX_CHARS.toLocaleString()} characters.`,
      },
      { status: 413 }
    );
  }

  try {
    assertGeminiConfiguredForAnalyze();
  } catch (e) {
    return Response.json(
      {
        error: e instanceof Error ? e.message : "LLM not configured",
      },
      { status: 503 }
    );
  }

  await getServerSession(authOptions);

  const stream = buildAnalyzeSseStream({
    text,
    slidesForStream,
    indiaContext,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
