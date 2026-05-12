import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import {
  getAnalysisForUser,
  getAnalysisIfAccessible,
} from "@/lib/analysis-store";
import { getGeminiGenerativeModel } from "@/lib/gemini";
import type { UserRole } from "@/lib/user-role";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(userId).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (role !== "angel") {
    return NextResponse.json({ error: "Angel role only" }, { status: 403 });
  }

  const row =
    (await getAnalysisForUser(params.id, userId)) ||
    (await getAnalysisIfAccessible(params.id, userId));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pack = [
    `## Scale Chaser\n${row.persona_outputs["scale-chaser"]}`,
    `## Conviction Buyer\n${row.persona_outputs["conviction-buyer"]}`,
    `## Reality Check\n${row.persona_outputs["reality-check"]}`,
  ].join("\n\n");

  const sys = `You write concise institutional investment memos. Output Markdown only with sections:
# Company
# Problem
# Solution
# Market
# Team
# Risks
# Recommendation
Use bullets. Keep under 900 words. Base content only on the provided analyst notes and excerpt.`;

  try {
    const model = getGeminiGenerativeModel(undefined, sys);
    const r = await model.generateContent(
      `# Pitch excerpt\n${row.input_preview ?? "(none)"}\n\n# Persona analyses\n${pack}`
    );
    const text = r.response.text();
    return NextResponse.json({ memo: text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Memo failed" },
      { status: 500 }
    );
  }
}
