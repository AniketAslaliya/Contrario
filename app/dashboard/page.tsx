import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { listAnalysesForUser } from "@/lib/analysis-store";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import type { UserRole } from "@/lib/user-role";

const HISTORY_ROLES: UserRole[] = ["founder", "student", "angel"];

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

  if (HISTORY_ROLES.includes(role)) {
    const rows = await listAnalysesForUser(session.user.id);

    return (
      <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
        <div className="max-w-3xl w-full">
          <div className="pill mx-auto mb-6 w-fit">Your analyses</div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink text-center mb-3">
            Session <span className="italic text-muted-word">history</span>
          </h1>
          <p className="text-ink-400 text-center text-sm mb-10 max-w-lg mx-auto leading-relaxed">
            Past runs are saved when you&apos;re signed in. Open any row to see
            full persona write-ups, conflict map, and red flags.
          </p>

          <div className="flex justify-center gap-4 mb-10">
            <Link href="/analyze" className="btn-primary text-center">
              New analysis
            </Link>
            <Link href="/settings" className="btn-secondary text-center">
              Account
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-cream-400 bg-cream-100/60 px-8 py-12 text-center">
              <p className="text-ink-600 mb-4">
                No saved analyses yet. Run your first adversarial pass on the
                analyze page — we&apos;ll store it here automatically.
              </p>
              <Link href="/analyze" className="btn-primary inline-block">
                Go to Analyze
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => {
                const d = new Date(r.created_at);
                return (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/analysis/${r.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-cream-400 bg-cream-100/70 px-5 py-4 hover:border-ink/15 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-ink">{r.title}</p>
                        <p className="text-xs text-ink-400 mt-1">
                          {d.toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                          <span className="mx-2">·</span>
                          <span className="capitalize">{r.source}</span>
                        </p>
                      </div>
                      <div className="text-sm text-ink-500 tabular-nums sm:text-right">
                        {r.avg_score != null ? (
                          <span className="rounded-full bg-ink text-cream-100 text-xs font-medium px-3 py-1">
                            Avg {r.avg_score}/10
                          </span>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    );
  }

  const allowedOrg: readonly UserRole[] = ["accelerator", "mentor"];
  if (!allowedOrg.includes(role)) redirect("/analyze");

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
