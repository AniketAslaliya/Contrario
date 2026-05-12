"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { insertAnalysis } from "@/lib/analysis-store";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import type { PersonaId } from "@/lib/personas";
import type { PitchSlide } from "@/lib/slide-split";
import type { SynthesisPayload } from "@/lib/synthesis/post-analysis";
import type { UserRole } from "@/lib/user-role";

const HISTORY_ROLES: UserRole[] = ["founder", "student", "angel"];

export async function saveAnalysisAction(input: {
  title: string;
  source: "paste" | "pdf";
  inputPreview: string;
  personaOutputs: Record<PersonaId, string>;
  synthesis: SynthesisPayload | null;
  slideOutline: PitchSlide[] | null;
  avgScore: number | null;
}): Promise<{ ok: true; id: string } | { ok: false; message: string } | { ok: true; skipped: true }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return { ok: false, message: "Sign in to save analyses to your history." };
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
    return { ok: true, skipped: true };
  }

  try {
    const id = await insertAnalysis({
      userId,
      title: input.title,
      source: input.source,
      inputPreview: input.inputPreview,
      personaOutputs: input.personaOutputs,
      synthesis: input.synthesis,
      slideOutline: input.slideOutline,
      avgScore: input.avgScore,
    });
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save analysis.",
    };
  }
}
