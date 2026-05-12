import { randomBytes } from "crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

function referralCode(): string {
  return randomBytes(5).toString("hex").slice(0, 10).toUpperCase();
}

export async function insertWaitlistEntry(params: {
  email: string;
  name?: string | null;
  referredBy?: string | null;
}): Promise<{ code: string }> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
  const code = referralCode();
  const { error } = await getSupabaseAdmin().from("waitlist_entries").insert({
    email: params.email.trim().toLowerCase().slice(0, 254),
    name: params.name?.trim().slice(0, 200) || null,
    referral_code: code,
    referred_by: params.referredBy?.trim().toUpperCase() || null,
  });
  if (error) throw new Error(error.message);
  return { code };
}

export async function countReferralsByCode(code: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { count, error } = await getSupabaseAdmin()
    .from("waitlist_entries")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", code.trim().toUpperCase());
  if (error) return 0;
  return count ?? 0;
}

export async function referralLeaderboard(limit = 15): Promise<
  { code: string; referrals: number }[]
> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("waitlist_entries")
    .select("referred_by")
    .not("referred_by", "is", null);
  if (error || !data) return [];
  const tally = new Map<string, number>();
  for (const row of data as { referred_by: string }[]) {
    const c = row.referred_by.trim().toUpperCase();
    if (!c) continue;
    tally.set(c, (tally.get(c) ?? 0) + 1);
  }
  return Array.from(tally.entries())
    .map(([code, referrals]) => ({ code, referrals }))
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, limit);
}
