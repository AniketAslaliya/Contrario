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

/** PostgREST / Postgres when optional profile columns from later migrations are not applied yet. */
function isOptionalColumnUnavailable(error: { message?: string } | null): boolean {
  const m = (error?.message ?? "").toLowerCase();
  if (!m) return false;
  if (m.includes("schema cache")) return true;
  if (m.includes("column") && m.includes("does not exist")) return true;
  /* e.g. Could not find the 'display_name' column of 'profiles' */
  if (m.includes("profiles") && m.includes("display_name")) return true;
  if (m.includes("profiles") && m.includes("last_deck")) return true;
  return false;
}

export async function getProfileByUserId(
  userId: string
): Promise<UserProfileRow | null> {
  if (!isSupabaseConfigured()) return null;

  const sb = getSupabaseAdmin();
  const full = await sb
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!full.error) return full.data as UserProfileRow | null;

  if (isOptionalColumnUnavailable(full.error)) {
    const minimal = await sb
      .from("profiles")
      .select("id, user_id, email, role, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (minimal.error) throw new Error(minimal.error.message);
    return minimal.data as UserProfileRow | null;
  }

  throw new Error(full.error.message);
}

export async function upsertProfile(params: {
  userId: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error } = await sb.from("profiles").upsert(
    {
      user_id: params.userId,
      email: params.email,
      role: params.role,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);

  if (params.displayName === undefined) return;

  const { error: nameError } = await sb
    .from("profiles")
    .update({
      display_name: params.displayName?.trim() || null,
      updated_at: now,
    })
    .eq("user_id", params.userId);

  if (nameError && !isOptionalColumnUnavailable(nameError)) {
    throw new Error(nameError.message);
  }
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

  if (error && !isOptionalColumnUnavailable(error)) {
    throw new Error(error.message);
  }
}
