import { NextRequest } from "next/server";
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

/** M25 · API access — set `CONTRARIO_API_KEY` in env; send `Authorization: Bearer <key>` or `x-api-key`. */
export async function POST(req: NextRequest) {
  const secret = process.env.CONTRARIO_API_KEY?.trim();
  if (!secret) {
    return Response.json(
      { error: "API access not configured (CONTRARIO_API_KEY)." },
      { status: 503 }
    );
  }

  const auth =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.headers.get("x-api-key");
  if (auth !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
