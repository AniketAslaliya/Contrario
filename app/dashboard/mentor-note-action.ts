"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { insertMentorNote } from "@/lib/mentor-notes-store";
import {
  getAnalysisForUser,
  getAnalysisIfAccessible,
} from "@/lib/analysis-store";
import { insertNotification } from "@/lib/notifications-store";
import type { UserRole } from "@/lib/user-role";

export async function addMentorNoteAction(input: {
  analysisId: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  const profile = await getProfileByUserId(userId).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (role !== "mentor") {
    return { ok: false, message: "Mentor accounts only." };
  }

  const body = input.body.trim();
  if (body.length < 3) return { ok: false, message: "Add a note." };

  const analysis =
    (await getAnalysisForUser(input.analysisId, userId)) ||
    (await getAnalysisIfAccessible(input.analysisId, userId));
  if (!analysis) {
    return { ok: false, message: "Analysis not found." };
  }

  try {
    await insertMentorNote({
      analysisId: input.analysisId,
      authorUserId: userId,
      body,
    });
    try {
      await insertNotification(
        analysis.user_id,
        "A mentor left feedback on your analysis."
      );
    } catch {
      /* optional */
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save note.",
    };
  }
}
