"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { upsertProfile, getProfileByUserId } from "@/lib/profile";
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, code: "unauthorized" };
  if (!isUserRole(role)) return { ok: false, code: "invalid_role" };
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_unconfigured" };
  }

  try {
    await upsertProfile({
      userId: session.user.id,
      email: session.user.email ?? null,
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
