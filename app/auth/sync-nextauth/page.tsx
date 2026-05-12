"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SyncNextAuthPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError || !session?.access_token) {
          setError(
            "We couldn’t read your session after the magic link. Try signing in again, and confirm redirect URLs in Supabase."
          );
          return;
        }

        const result = await signIn("supabase-bridge", {
          access_token: session.access_token,
          redirect: false,
          callbackUrl: "/onboarding",
        });

        if (cancelled) return;

        if (result?.error) {
          setError("Could not finish sign-in. Please try again.");
          return;
        }

        window.location.href = result?.url ?? "/onboarding";
      } catch {
        if (!cancelled) setError("Something went wrong. Please try again.");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="card !rounded-3xl !p-10 max-w-md text-center">
        <h1 className="font-serif text-2xl text-ink mb-3">
          {error ? "Sign-in incomplete" : "Finishing sign-in…"}
        </h1>
        {error ? (
          <>
            <p className="text-sm text-ink-600 mb-8 leading-relaxed">{error}</p>
            <Link href="/auth" className="btn-primary !rounded-2xl inline-block">
              Back to sign in
            </Link>
          </>
        ) : (
          <p className="text-sm text-ink-600">Linking your account securely.</p>
        )}
      </div>
    </main>
  );
}
