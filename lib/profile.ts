import type { UserRole } from "@/lib/user-role";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export type UserProfileRow = {
  id: string;
  user_id: string;
  email: string | null;
  display_name?: string | null;
  role: UserRole;
  org_id?: string | null;
  last_deck_storage_path?: string | null;
  last_deck_file_name?: string | null;
  last_deck_at?: string | null;
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
  displayName?: string | null;
}): Promise<void> {
  const sb = getSupabaseAdmin();

  const row: Record<string, unknown> = {
    user_id: params.userId,
    email: params.email,
    role: params.role,
    updated_at: new Date().toISOString(),
  };
  if (params.displayName !== undefined) {
    row.display_name = params.displayName?.trim() || null;
  }

  const { error } = await sb.from("profiles").upsert(row, {
    onConflict: "user_id",
  });

  if (error) throw new Error(error.message);
}

export async function updateLastDeckForUser(params: {
  userId: string;
  storagePath: string;
  fileName: string;
}): Promise<void> {
  const sb = getSupabaseAdmin();

  const { error } = await sb
    .from("profiles")
    .update({
      last_deck_storage_path: params.storagePath,
      last_deck_file_name: params.fileName.slice(0, 200),
      last_deck_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", params.userId);

  if (error) throw new Error(error.message);
}
