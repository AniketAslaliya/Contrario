import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { listAnalysesForOrg } from "@/lib/analysis-store";
import type { UserRole } from "@/lib/user-role";
import { ShortlistTable } from "@/app/dashboard/shortlist/ShortlistTable";

const ROLES: UserRole[] = ["accelerator", "mentor"];

export default async function ShortlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const profile = await getProfileByUserId(session.user.id).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!role || !ROLES.includes(role)) redirect("/dashboard");

  const orgId = profile?.org_id;
  if (!orgId) {
    return (
      <main className="relative min-h-screen flex flex-col items-center px-6 py-16">
        <p className="text-ink-500 mb-4">Join an organization first.</p>
        <Link href="/dashboard/org" className="btn-primary">
          Org settings
        </Link>
      </main>
    );
  }

  const rows = await listAnalysesForOrg(orgId);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-4xl">
        <Link
          href="/dashboard"
          className="text-xs text-ink-400 hover:text-ink mb-6 inline-block"
        >
          ← Dashboard
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-2">Ranked shortlist</h1>
        <p className="text-sm text-ink-500 mb-8">
          Org analyses by average score. Star decks for follow-up.
        </p>
        <ShortlistTable rows={rows} />
      </div>
    </main>
  );
}
