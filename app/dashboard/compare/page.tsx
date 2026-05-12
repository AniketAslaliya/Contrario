import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { compareDeckAnalyses } from "@/lib/deck-compare";
import {
  getAnalysisForUser,
  listAnalysesForUser,
} from "@/lib/analysis-store";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { ComparePicker } from "@/components/dashboard/ComparePicker";
import { DeckCompareView } from "@/components/dashboard/DeckCompareView";
import type { UserRole } from "@/lib/user-role";

const HISTORY_ROLES: UserRole[] = ["founder", "student", "angel"];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");
  if (!isSupabaseConfigured()) redirect("/analyze");

  let profile: Awaited<ReturnType<typeof getProfileByUserId>> | null = null;
  try {
    profile = await getProfileByUserId(session.user.id);
  } catch {
    profile = null;
  }
  if (!profile?.role) redirect("/onboarding");

  const role = profile.role as UserRole;
  if (!HISTORY_ROLES.includes(role)) redirect("/dashboard");

  const uid = session.user.id;
  const rows = await listAnalysesForUser(uid);

  const v1raw = searchParams.v1;
  const v2raw = searchParams.v2;
  const v1 = typeof v1raw === "string" ? v1raw : undefined;
  const v2 = typeof v2raw === "string" ? v2raw : undefined;

  if (v1 && v2 && v1 !== v2) {
    const a = await getAnalysisForUser(v1, uid);
    const b = await getAnalysisForUser(v2, uid);
    if (!a || !b) notFound();
    const data = compareDeckAnalyses(a, b);
    return (
      <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
        <DeckCompareView data={data} />
        <div className="mt-8 text-center">
          <Link href="/dashboard/compare" className="text-sm text-ink-400 hover:text-ink">
            ← Pick different runs
          </Link>
        </div>
      </main>
    );
  }

  const pickerData = rows.map((r) => ({
    id: r.id,
    title: r.title,
    created_at: r.created_at,
  }));

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <div className="max-w-3xl w-full mb-10 text-center">
        <Link
          href="/dashboard"
          className="text-xs text-ink-400 hover:text-ink mb-4 inline-block"
        >
          ← Dashboard
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">
          Compare <span className="italic text-muted-word">versions</span>
        </h1>
        <p className="text-ink-400 text-sm mt-3 max-w-md mx-auto">
          Select two saved analyses to see how scores and concerns shifted.
        </p>
      </div>
      {pickerData.length >= 2 ? (
        <ComparePicker analyses={pickerData} />
      ) : (
        <div className="rounded-3xl border border-cream-400 bg-cream-100/60 px-8 py-10 text-center max-w-md">
          <p className="text-ink-600 text-sm mb-4">
            You need at least two saved runs. Run another analysis, then come
            back here.
          </p>
          <Link href="/analyze" className="btn-primary inline-block">
            Analyze
          </Link>
        </div>
      )}
    </main>
  );
}
