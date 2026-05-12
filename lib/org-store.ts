import { randomBytes } from "crypto";
import type { PersonaId } from "@/lib/personas";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export type OrgRow = {
  id: string;
  name: string;
  invite_code: string;
  persona_weights: Record<PersonaId, number>;
  created_by: string;
  created_at: string;
};

const DEFAULT_WEIGHTS: Record<PersonaId, number> = {
  "scale-chaser": 0.34,
  "conviction-buyer": 0.33,
  "reality-check": 0.33,
};

function parseWeights(raw: unknown): Record<PersonaId, number> {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_WEIGHTS };
  const o = raw as Record<string, unknown>;
  const out = { ...DEFAULT_WEIGHTS };
  for (const k of Object.keys(DEFAULT_WEIGHTS) as PersonaId[]) {
    const n = Number(o[k]);
    if (Number.isFinite(n) && n >= 0 && n <= 1) out[k] = n;
  }
  const sum = Object.values(out).reduce((a, b) => a + b, 0);
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };
  for (const k of Object.keys(out) as PersonaId[]) {
    out[k] = out[k] / sum;
  }
  return out;
}

export function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function getOrgById(id: string): Promise<OrgRow | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const r = data as Record<string, unknown>;
  return {
    id: String(r.id),
    name: String(r.name ?? "Org"),
    invite_code: String(r.invite_code ?? ""),
    persona_weights: parseWeights(r.persona_weights),
    created_by: String(r.created_by ?? ""),
    created_at: String(r.created_at ?? ""),
  };
}

export async function createOrganization(params: {
  userId: string;
  name: string;
}): Promise<{ orgId: string; inviteCode: string }> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
  const invite_code = generateInviteCode();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("organizations")
    .insert({
      name: params.name.slice(0, 120),
      invite_code,
      created_by: params.userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const orgId = (data as { id: string }).id;
  await sb.from("org_members").insert({
    org_id: orgId,
    user_id: params.userId,
    role: "admin",
  });
  await sb
    .from("profiles")
    .update({ org_id: orgId, updated_at: new Date().toISOString() })
    .eq("user_id", params.userId);
  return { orgId, inviteCode: invite_code };
}

export async function joinOrganizationByCode(params: {
  userId: string;
  code: string;
}): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
  const code = params.code.trim().toUpperCase();
  const sb = getSupabaseAdmin();
  const { data: org, error: e1 } = await sb
    .from("organizations")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!org) throw new Error("Invalid invite code");
  const orgId = (org as { id: string }).id;
  await sb.from("org_members").upsert(
    { org_id: orgId, user_id: params.userId, role: "member" },
    { onConflict: "org_id,user_id" }
  );
  await sb
    .from("profiles")
    .update({ org_id: orgId, updated_at: new Date().toISOString() })
    .eq("user_id", params.userId);
  return orgId;
}

export async function isOrgAdmin(
  userId: string,
  orgId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data, error } = await getSupabaseAdmin()
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return (data as { role?: string } | null)?.role === "admin";
}

export async function updateOrgPersonaWeights(
  orgId: string,
  weights: Record<PersonaId, number>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const w = parseWeights(weights);
  const { error } = await getSupabaseAdmin()
    .from("organizations")
    .update({ persona_weights: w })
    .eq("id", orgId);
  if (error) throw new Error(error.message);
}
