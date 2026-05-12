import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import type { PitchSlide } from "@/lib/slide-split";
import type { SynthesisPayload } from "@/lib/synthesis/post-analysis";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export type AnalysisRow = {
  id: string;
  user_id: string;
  title: string;
  source: "paste" | "pdf";
  input_preview: string | null;
  persona_outputs: Record<PersonaId, string>;
  synthesis: SynthesisPayload | null;
  slide_outline: PitchSlide[] | null;
  avg_score: number | null;
  created_at: string;
  org_id: string | null;
  starred: boolean;
};

function mapRow(r: Record<string, unknown>): AnalysisRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    title: String(r.title ?? "Untitled"),
    source: r.source === "pdf" ? "pdf" : "paste",
    input_preview:
      typeof r.input_preview === "string" ? r.input_preview : null,
    persona_outputs: parseOutputs(r.persona_outputs),
    synthesis: (r.synthesis ?? null) as SynthesisPayload | null,
    slide_outline: (r.slide_outline ?? null) as PitchSlide[] | null,
    avg_score: typeof r.avg_score === "number" ? r.avg_score : null,
    created_at: String(r.created_at ?? ""),
    org_id: typeof r.org_id === "string" ? r.org_id : null,
    starred: r.starred === true,
  };
}

function parseOutputs(raw: unknown): Record<PersonaId, string> {
  const out: Record<PersonaId, string> = {
    "scale-chaser": "",
    "conviction-buyer": "",
    "reality-check": "",
  };
  if (!raw || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  for (const id of PERSONA_IDS) {
    const v = o[id];
    out[id] = typeof v === "string" ? v : "";
  }
  return out;
}

export async function insertAnalysis(params: {
  userId: string;
  title: string;
  source: "paste" | "pdf";
  inputPreview: string;
  personaOutputs: Record<PersonaId, string>;
  synthesis: SynthesisPayload | null;
  slideOutline: PitchSlide[] | null;
  avgScore: number | null;
  orgId?: string | null;
}): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("analyses")
    .insert({
      user_id: params.userId,
      title: params.title.slice(0, 200),
      source: params.source,
      input_preview: params.inputPreview.slice(0, 2000),
      persona_outputs: params.personaOutputs,
      synthesis: params.synthesis,
      slide_outline: params.slideOutline,
      avg_score: params.avgScore,
      ...(params.orgId ? { org_id: params.orgId } : {}),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function listAnalysesForUser(
  userId: string
): Promise<AnalysisRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((r) => mapRow(r));
}

export async function listAnalysesForOrg(
  orgId: string,
  limit = 100
): Promise<AnalysisRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("analyses")
    .select("*")
    .eq("org_id", orgId)
    .order("avg_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((r) => mapRow(r));
}

export async function setAnalysisStarred(
  analysisId: string,
  orgId: string,
  starred: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabaseAdmin()
    .from("analyses")
    .update({ starred })
    .eq("id", analysisId)
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);
}

export async function getAnalysisForUser(
  id: string,
  userId: string
): Promise<AnalysisRow | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const r = data as Record<string, unknown>;
  return mapRow(r);
}

/** Owner, or org member when the analysis belongs to that org. */
export async function getAnalysisIfAccessible(
  id: string,
  userId: string
): Promise<AnalysisRow | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const r = data as Record<string, unknown>;
  if (String(r.user_id) === userId) return mapRow(r);

  const analysisOrg = r.org_id ? String(r.org_id) : null;
  if (!analysisOrg) return null;

  const { data: prof } = await getSupabaseAdmin()
    .from("profiles")
    .select("org_id")
    .eq("user_id", userId)
    .maybeSingle();
  const viewerOrg =
    prof && typeof (prof as { org_id?: unknown }).org_id === "string"
      ? (prof as { org_id: string }).org_id
      : null;
  if (viewerOrg !== analysisOrg) return null;

  const { data: mem } = await getSupabaseAdmin()
    .from("org_members")
    .select("user_id")
    .eq("org_id", analysisOrg)
    .eq("user_id", userId)
    .maybeSingle();

  if (mem) return mapRow(r);
  return null;
}
