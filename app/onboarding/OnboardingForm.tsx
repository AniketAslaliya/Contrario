"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RolePicker } from "@/components/onboarding/RolePicker";
import { saveOnboardingRole } from "@/app/actions/profile";
import type { UserRole } from "@/lib/user-role";
import { getHomePathForRole } from "@/lib/user-role";

export function OnboardingForm({
  supabaseConfigured,
  emailHint,
}: {
  supabaseConfigured: boolean;
  emailHint?: string | null;
}) {
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  async function onPick(role: UserRole) {
    setPendingRole(role);
    setClientError(null);

    const result = await saveOnboardingRole(role);

    if (!result.ok) {
      const msg =
        result.code === "unauthorized"
          ? "Your session expired. Sign in again."
          : result.code === "supabase_unconfigured"
            ? "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, run the profiles migration in Supabase, then retry."
            : result.code === "invalid_role"
              ? "Unsupported role selection."
              : result.message ??
                "Could not save your role — check Supabase SQL migration.";
      setClientError(msg);
      setPendingRole(null);
      return;
    }

    router.push(getHomePathForRole(role));
    router.refresh();
  }

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

        <div className="card !rounded-3xl !p-10">
          <span className="font-serif text-3xl text-ink tracking-tight">
            Who are you building with?
          </span>
          <p className="text-sm text-ink-400 mt-3 leading-relaxed">
            Contrario tweaks defaults and dashboards for your archetype.{` `}
            {emailHint ? (
              <>
                Signed in as <span className="text-ink">{emailHint}</span>.
              </>
            ) : null}
          </p>

          {!supabaseConfigured ? (
            <div className="mt-6 p-3 rounded-xl border border-persona-scale/25 bg-persona-scale/5 text-persona-scale text-sm">
              Supabase keys are missing — your role cannot be persisted yet.
              See <span className="font-medium">CONTEXT.md</span> for setup.
            </div>
          ) : null}

          {clientError ? (
            <div className="mt-6 p-3 rounded-xl border border-persona-scale/25 bg-persona-scale/5 text-persona-scale text-sm">
              {clientError}
            </div>
          ) : null}

          <RolePicker pendingRole={pendingRole} onPick={onPick} />
        </div>
      </div>
    </main>
  );
}
