"use server";

import { randomBytes } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAnalysisForUser } from "@/lib/analysis-store";
import { getProfileByUserId } from "@/lib/profile";
import { insertSharedReport } from "@/lib/shared-report-store";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import type { UserRole } from "@/lib/user-role";

const HISTORY_ROLES: UserRole[] = ["founder", "student", "angel"];

function baseUrl(): string {
  const u = process.env.NEXTAUTH_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:3000";
}

function expiryDate(option: "7" | "30" | "never"): Date | null {
  if (option === "never") return null;
  const days = option === "7" ? 7 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createShareReportAction(input: {
  analysisId: string;
  expiry: "7" | "30" | "never";
}): Promise<
  | { ok: true; url: string }
  | { ok: false; message: string }
> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return { ok: false, message: "Sign in to create a share link." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  let profile: Awaited<ReturnType<typeof getProfileByUserId>> | null = null;
  try {
    profile = await getProfileByUserId(userId);
  } catch {
    profile = null;
  }
  const role = profile?.role as UserRole | undefined;
  if (!role || !HISTORY_ROLES.includes(role)) {
    return { ok: false, message: "Sharing is available for founder-style accounts." };
  }

  const row = await getAnalysisForUser(input.analysisId, userId);
  if (!row) {
    return { ok: false, message: "Analysis not found." };
  }

  const slug = randomBytes(12).toString("hex");
  try {
    await insertSharedReport({
      userId,
      analysisId: input.analysisId,
      slug,
      expiresAt: expiryDate(input.expiry),
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create link.",
    };
  }

  return { ok: true, url: `${baseUrl()}/r/${slug}` };
}
