import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getAnalysisForUser,
  getAnalysisIfAccessible,
} from "@/lib/analysis-store";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { AnalysisReplay } from "@/components/dashboard/AnalysisReplay";
import type { UserRole } from "@/lib/user-role";

export default async function AnalysisTriagePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  if (!isSupabaseConfigured()) notFound();

  const profile = await getProfileByUserId(session.user.id).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!profile?.role) notFound();

  let row =
    await getAnalysisForUser(params.id, session.user.id);
  if (
    !row &&
    (role === "accelerator" || role === "mentor")
  ) {
    row = await getAnalysisIfAccessible(params.id, session.user.id);
  }
  if (!row) notFound();

  const showMemo = role === "angel";

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-12 md:py-16">
      <AnalysisReplay
        analysis={row}
        triageMode
        showPdfDownload
        showMemoButton={showMemo}
      />
      <div className="mt-8 text-center">
        <Link
          href={`/dashboard/analysis/${params.id}`}
          className="text-sm text-ink-400 hover:text-ink underline"
        >
          Full analysis view
        </Link>
      </div>
    </main>
  );
}
