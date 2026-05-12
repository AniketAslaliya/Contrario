"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { upsertProfile, getProfileByUserId, updateLastDeckForUser } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { isUserRole } from "@/lib/user-role";

export type { UserRole } from "@/lib/user-role";

export type ProfileActionResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "invalid_role"
        | "supabase_unconfigured"
        | "persist_failed";
      message?: string;
    };

export async function saveOnboardingRole(
  role: string
): Promise<ProfileActionResult> {
  return completeOnboardingProfile({ role });
}

/** Saves role + optional display name in one step (smooth onboarding). */
export async function completeOnboardingProfile(input: {
  role: string;
  displayName?: string | null;
}): Promise<ProfileActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };
  if (!isUserRole(input.role)) return { ok: false, code: "invalid_role" };
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_unconfigured" };
  }

  try {
    await upsertProfile({
      userId: session.user.id,
      email: session.user.email ?? null,
      role: input.role,
      displayName:
        input.displayName === undefined
          ? undefined
          : input.displayName?.trim() || null,
    });
  } catch (e) {
    return {
      ok: false,
      code: "persist_failed",
      message: e instanceof Error ? e.message : undefined,
    };
  }

  return { ok: true };
}

export type RecordDeckResult =
  | { ok: true }
  | { ok: false; code: "unauthorized" | "invalid_path" | "failed" };

/** Call after a signed-in user uploads a PDF that was stored in Supabase Storage. */
export async function recordLastDeckAction(
  storagePath: string,
  fileName: string
): Promise<RecordDeckResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, code: "unauthorized" };
  if (!storagePath.startsWith(`${userId}/`)) {
    return { ok: false, code: "invalid_path" };
  }
  if (!isSupabaseConfigured()) return { ok: true };

  try {
    const profile = await getProfileByUserId(userId);
    if (!profile?.role) return { ok: true };

    await updateLastDeckForUser({
      userId,
      storagePath,
      fileName,
    });
  } catch {
    return { ok: false, code: "failed" };
  }

  return { ok: true };
}

export async function saveUserRole(role: string): Promise<ProfileActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };
  if (!isUserRole(role)) return { ok: false, code: "invalid_role" };
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_unconfigured" };
  }

  let email: string | null = session.user.email ?? null;
  try {
    const existing = await getProfileByUserId(session.user.id);
    if (existing?.email) email = existing.email;

    await upsertProfile({
      userId: session.user.id,
      email,
      role,
    });
  } catch (e) {
    return {
      ok: false,
      code: "persist_failed",
      message: e instanceof Error ? e.message : undefined,
    };
  }

  return { ok: true };
}
