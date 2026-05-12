import type { AnalysisRow } from "@/lib/analysis-store";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import type { PitchSlide } from "@/lib/slide-split";
import type { SynthesisPayload } from "@/lib/synthesis/post-analysis";

function mapAnalysisRow(raw: Record<string, unknown>): AnalysisRow {
  const parseOutputs = (
    persona_outputs: unknown
  ): Record<PersonaId, string> => {
    const out: Record<PersonaId, string> = {
      "scale-chaser": "",
      "conviction-buyer": "",
      "reality-check": "",
    };
    if (!persona_outputs || typeof persona_outputs !== "object") return out;
    const o = persona_outputs as Record<string, unknown>;
    for (const id of PERSONA_IDS) {
      const v = o[id];
      out[id] = typeof v === "string" ? v : "";
    }
    return out;
  };

  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    title: String(raw.title ?? "Untitled"),
    source: raw.source === "pdf" ? "pdf" : "paste",
    input_preview:
      typeof raw.input_preview === "string" ? raw.input_preview : null,
    persona_outputs: parseOutputs(raw.persona_outputs),
    synthesis: (raw.synthesis ?? null) as SynthesisPayload | null,
    slide_outline: (raw.slide_outline ?? null) as PitchSlide[] | null,
    avg_score: typeof raw.avg_score === "number" ? raw.avg_score : null,
    created_at: String(raw.created_at ?? ""),
  };
}

export async function insertSharedReport(params: {
  userId: string;
  analysisId: string;
  slug: string;
  expiresAt: Date | null;
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await getSupabaseAdmin().from("shared_reports").insert({
    user_id: params.userId,
    analysis_id: params.analysisId,
    slug: params.slug,
    expires_at: params.expiresAt?.toISOString() ?? null,
  });

  if (error) throw new Error(error.message);
}

/** Public read — returns null if missing or expired. */
export async function getSharedAnalysisBySlug(
  slug: string
): Promise<AnalysisRow | null> {
  if (!isSupabaseConfigured()) return null;

  const sb = getSupabaseAdmin();
  const { data: link, error: e1 } = await sb
    .from("shared_reports")
    .select("expires_at, analysis_id")
    .eq("slug", slug)
    .maybeSingle();

  if (e1 || !link) return null;

  const exp = link.expires_at as string | null;
  if (exp && new Date(exp) < new Date()) return null;

  const aid = String((link as { analysis_id: string }).analysis_id);

  const { data: row, error: e2 } = await sb
    .from("analyses")
    .select("*")
    .eq("id", aid)
    .maybeSingle();

  if (e2 || !row) return null;

  return mapAnalysisRow(row as Record<string, unknown>);
}
