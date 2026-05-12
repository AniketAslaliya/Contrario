import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { SettingsRoleForm } from "./SettingsRoleForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/auth");

  const configured = isSupabaseConfigured();
  let profile: Awaited<ReturnType<typeof getProfileByUserId>> | null = null;

  try {
    if (configured) {
      profile = await getProfileByUserId(session.user.id);
    }
  } catch {
    profile = null;
  }

  if (configured && !profile?.role) redirect("/onboarding");

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink transition-colors duration-300 mb-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to home
        </Link>

        {configured && profile?.role ? (
          <SettingsRoleForm
            supabaseConfigured={configured}
            currentRole={profile.role}
          />
        ) : (
          <div className="card !rounded-3xl !p-10 text-center space-y-4">
            <p className="text-ink">
              Finish Supabase wiring to save your archetype securely.
            </p>
            <p className="text-sm text-ink-400">
              Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, run the
              profiles migration in `supabase/migrations`, then complete onboarding.
            </p>
            <Link href="/onboarding" className="btn-primary inline-block mt-4">
              Go to onboarding
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
