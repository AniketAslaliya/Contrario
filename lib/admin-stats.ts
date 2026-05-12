import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export async function fetchAdminStats(): Promise<{
  analysisCount: number;
  profileCount: number;
}> {
  if (!isSupabaseConfigured()) {
    return { analysisCount: 0, profileCount: 0 };
  }
  const sb = getSupabaseAdmin();
  const a = await sb
    .from("analyses")
    .select("id", { count: "exact", head: true });
  const p = await sb
    .from("profiles")
    .select("user_id", { count: "exact", head: true });
  return {
    analysisCount: a.count ?? 0,
    profileCount: p.count ?? 0,
  };
}
