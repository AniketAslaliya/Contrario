import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isContrarioAdmin } from "@/lib/admin-guard";
import { fetchAdminStats } from "@/lib/admin-stats";

export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isContrarioAdmin(email)) notFound();

  const stats = await fetchAdminStats();

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-2">
          Internal
        </p>
        <h1 className="font-serif text-3xl text-ink mb-8">Usage snapshot</h1>
        <dl className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-cream-400 bg-cream-100/70 p-4">
            <dt className="text-xs text-ink-400">Analyses stored</dt>
            <dd className="text-2xl font-medium tabular-nums text-ink">
              {stats.analysisCount}
            </dd>
          </div>
          <div className="rounded-2xl border border-cream-400 bg-cream-100/70 p-4">
            <dt className="text-xs text-ink-400">Profiles</dt>
            <dd className="text-2xl font-medium tabular-nums text-ink">
              {stats.profileCount}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-ink-500 mb-6">
          Set <code className="text-xs bg-cream-200/80 px-1 rounded">CONTRARIO_ADMIN_EMAILS</code>{" "}
          (comma-separated) to gate this page. API spend and red-flag mining can be
          layered on via warehouse exports.
        </p>
        <Link href="/" className="text-sm text-ink-400 hover:text-ink">
          ← Home
        </Link>
      </div>
    </main>
  );
}
