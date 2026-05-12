import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import type { UserRole } from "@/lib/user-role";

export default async function DashboardPage() {
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
  const allowedDashboard: readonly UserRole[] = ["accelerator", "mentor"];
  if (!allowedDashboard.includes(role)) redirect("/analyze");

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="pill mx-auto mb-8">Workspace</div>
        <h1 className="font-serif text-5xl md:text-6xl text-ink mb-6">
          Org <span className="italic text-muted-word">Home</span>
        </h1>
        <p className="text-ink-400 text-base leading-relaxed mb-6">
          Cohort analytics, batch uploads, ranked shortlists, and mentor overlays
          will land here soon. Founder and angel flows route through analysis.
        </p>
        <p className="text-sm text-ink-500 mb-10">
          Viewing dashboard as{" "}
          <span className="text-ink font-medium capitalize">{role}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/analyze" className="btn-primary text-center">
            Go to Analyze
          </Link>
          <Link href="/settings" className="btn-secondary text-center">
            Role &amp; account
          </Link>
          <Link href="/" className="btn-secondary text-center">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
