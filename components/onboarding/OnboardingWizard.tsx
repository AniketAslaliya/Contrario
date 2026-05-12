"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RolePicker } from "@/components/onboarding/RolePicker";
import { completeOnboardingProfile } from "@/app/actions/profile";
import type { UserRole } from "@/lib/user-role";
import { getHomePathForRole } from "@/lib/user-role";

const steps = ["welcome", "name", "role"] as const;

export function OnboardingWizard({
  supabaseConfigured,
  emailHint,
}: {
  supabaseConfigured: boolean;
  emailHint?: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const firstNameDefault = useMemo(() => {
    if (!emailHint?.includes("@")) return "";
    return emailHint.split("@")[0]?.replace(/\./g, " ") ?? "";
  }, [emailHint]);

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  async function onPick(role: UserRole) {
    setPendingRole(role);
    setClientError(null);

    const result = await completeOnboardingProfile({
      role,
      displayName: displayName.trim() || null,
    });

    if (!result.ok) {
      const msg =
        result.code === "unauthorized"
          ? "Your session expired. Sign in again."
          : result.code === "supabase_unconfigured"
            ? "Add Supabase env vars and run the profiles migration, then retry."
            : result.code === "invalid_role"
              ? "Unsupported role selection."
              : result.message ??
                "Could not save your profile — check Supabase SQL migration.";
      setClientError(msg);
      setPendingRole(null);
      return;
    }

    router.push(getHomePathForRole(role));
    router.refresh();
  }

  const stepId = steps[step];

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-persona-conviction/15 via-transparent to-transparent" />

      <div className="w-full max-w-lg relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink transition-colors duration-300 mb-8"
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

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step
                  ? "w-8 bg-ink"
                  : i < step
                    ? "w-1.5 bg-persona-conviction"
                    : "w-1.5 bg-cream-400"
              }`}
            />
          ))}
        </div>

        <div className="rounded-[2rem] border border-cream-400/80 bg-cream-100/90 backdrop-blur-md shadow-[0_25px_60px_-20px_rgba(28,25,23,0.15)] px-8 sm:px-10 py-10">
          {!supabaseConfigured ? (
            <div className="mb-6 p-4 rounded-2xl border border-persona-scale/25 bg-persona-scale/5 text-persona-scale text-sm leading-relaxed">
              Supabase keys are missing — your profile cannot be saved yet. See{" "}
              <span className="font-medium">README / .env.example</span>.
            </div>
          ) : null}

          {clientError ? (
            <div className="mb-6 p-4 rounded-2xl border border-persona-scale/25 bg-persona-scale/5 text-persona-scale text-sm">
              {clientError}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {stepId === "welcome" ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-persona-conviction font-medium mb-3">
                  Welcome
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight mb-4">
                  You&apos;re in. Let&apos;s tune Contrario to{" "}
                  <span className="italic text-muted-word">you</span>.
                </h1>
                <p className="text-ink-500 text-sm leading-relaxed mb-8">
                  Three quick steps — then adversarial analysis, conflict maps,
                  and history tailored to how you work.
                  {emailHint ? (
                    <>
                      {" "}
                      <span className="text-ink-600">
                        Signed in as{" "}
                        <span className="font-medium text-ink">{emailHint}</span>
                        .
                      </span>
                    </>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-primary w-full !rounded-2xl !py-3.5"
                >
                  Continue
                </button>
              </motion.div>
            ) : null}

            {stepId === "name" ? (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-persona-reality font-medium mb-3">
                  Profile
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
                  What should we call you?
                </h2>
                <p className="text-ink-500 text-sm mb-6 leading-relaxed">
                  Optional — used in emails and on your dashboard. You can change
                  this later.
                </p>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Preferred name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={firstNameDefault || "Alex"}
                  className="w-full px-4 py-3.5 rounded-2xl bg-cream-50 border border-cream-400 text-ink placeholder:text-ink-400 focus:outline-none focus:border-persona-conviction focus:ring-1 focus:ring-persona-conviction/20 transition-all mb-8"
                  maxLength={80}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="btn-secondary flex-1 !rounded-2xl !py-3.5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-primary flex-1 !rounded-2xl !py-3.5"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            ) : null}

            {stepId === "role" ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-persona-scale font-medium mb-3">
                  Archetype
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
                  Who are you building with?
                </h2>
                <p className="text-ink-500 text-sm mb-6 leading-relaxed">
                  We shape defaults, dashboard entry, and what you see first.
                </p>
                <RolePicker pendingRole={pendingRole} onPick={onPick} />
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-6 w-full text-sm text-ink-500 hover:text-ink transition-colors"
                >
                  ← Back to name
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
