"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RolePicker } from "@/components/onboarding/RolePicker";
import { saveUserRole } from "@/app/actions/profile";
import type { UserRole } from "@/lib/user-role";
import { getHomePathForRole } from "@/lib/user-role";

export function SettingsRoleForm({
  supabaseConfigured,
  currentRole,
}: {
  supabaseConfigured: boolean;
  currentRole: UserRole;
}) {
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onPick(role: UserRole) {
    if (role === currentRole && supabaseConfigured) {
      router.push(getHomePathForRole(role));
      router.refresh();
      return;
    }

    setPendingRole(role);
    setFeedback(null);

    const result = await saveUserRole(role);

    if (!result.ok) {
      const msg =
        result.code === "unauthorized"
          ? "Session expired — sign in again."
          : result.code === "supabase_unconfigured"
            ? "Add Supabase env vars plus the profiles table migration."
            : result.code === "invalid_role"
              ? "Unsupported role selection."
              : result.message ??
                "Could not update role — verify Supabase configuration.";
      setFeedback(msg);
      setPendingRole(null);
      return;
    }

    router.push(getHomePathForRole(role));
    router.refresh();
  }

  return (
    <div className="card !rounded-3xl !p-10">
      <span className="font-serif text-3xl text-ink tracking-tight">
        Primary role
      </span>
      <p className="text-sm text-ink-400 mt-3">
        Updating your archetype swaps your default dashboard between analysis and
        org workspace flows.
      </p>
      {!supabaseConfigured ? (
        <div className="mt-6 p-3 rounded-xl border border-persona-conviction/25 bg-persona-conviction/10 text-persona-conviction text-sm">
          Supabase is not configured — changes cannot be saved yet.
        </div>
      ) : null}
      <p className="text-xs text-ink-400 uppercase tracking-[0.12em] mt-8 mb-2">
        Current · <span className="text-ink capitalize">{currentRole}</span>
      </p>
      {feedback ? (
        <div className="mt-6 p-3 rounded-xl border border-persona-scale/25 bg-persona-scale/5 text-persona-scale text-sm">
          {feedback}
        </div>
      ) : null}
      <RolePicker pendingRole={pendingRole} onPick={onPick} />
      <div className="mt-10 pt-6 border-t border-cream-400">
        <Link
          href="/analyze"
          className="block text-center text-sm text-ink font-medium hover:text-persona-scale transition-colors"
        >
          Back to Analyze →
        </Link>
      </div>
    </div>
  );
}
