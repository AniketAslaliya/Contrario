import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAnalysisForUser } from "@/lib/analysis-store";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { AnalysisReplay } from "@/components/dashboard/AnalysisReplay";
import type { UserRole } from "@/lib/user-role";

const HISTORY_ROLES: UserRole[] = ["founder", "student", "angel"];

export default async function SavedAnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
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
  if (!HISTORY_ROLES.includes(role)) {
    redirect("/dashboard");
  }

  const row = await getAnalysisForUser(id, session.user.id);
  if (!row) notFound();

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <AnalysisReplay analysis={row} />
      <div className="mt-12 text-center">
        <Link href="/analyze" className="btn-secondary inline-block">
          New analysis
        </Link>
      </div>
    </main>
  );
}
