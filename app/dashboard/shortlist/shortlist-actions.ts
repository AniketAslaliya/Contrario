"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { setAnalysisStarred } from "@/lib/analysis-store";
import type { UserRole } from "@/lib/user-role";

const ORG_ROLES: UserRole[] = ["accelerator", "mentor"];

export async function toggleAnalysisStarAction(input: {
  analysisId: string;
  starred: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  const profile = await getProfileByUserId(userId).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  const orgId = profile?.org_id;
  if (!role || !ORG_ROLES.includes(role) || !orgId) {
    return { ok: false, message: "Org workspace only." };
  }

  try {
    await setAnalysisStarred(input.analysisId, orgId, input.starred);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Update failed.",
    };
  }
}
