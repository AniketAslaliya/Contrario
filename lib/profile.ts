import type { UserRole } from "@/lib/user-role";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export type UserProfileRow = {
  id: string;
  user_id: string;
  email: string | null;
  role: UserRole;
  org_id?: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfileByUserId(
  userId: string
): Promise<UserProfileRow | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserProfileRow | null;
}

export async function upsertProfile(params: {
  userId: string;
  email: string | null;
  role: UserRole;
}): Promise<void> {
  const sb = getSupabaseAdmin();

  const { error } = await sb.from("profiles").upsert(
    {
      user_id: params.userId,
      email: params.email,
      role: params.role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}
