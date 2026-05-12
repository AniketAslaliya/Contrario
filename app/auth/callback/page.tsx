"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * PKCE magic links must exchange the `code` in the **browser** so the stored
 * code_verifier matches (server-initiated OTP breaks the flow).
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createSupabaseBrowserClient();
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (code) {
          const { error: exErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            console.error("[auth/callback]", exErr.message);
            if (!cancelled) {
              setError(
                "This sign-in link is invalid or expired. Request a new one from the sign-in page."
              );
            }
            return;
          }
        } else if (tokenHash && type) {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (otpErr) {
            console.error("[auth/callback]", otpErr.message);
            if (!cancelled) {
              setError(
                "This sign-in link is invalid or expired. Request a new one from the sign-in page."
              );
            }
            return;
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.access_token) {
            if (!cancelled) {
              setError(
                "Missing sign-in parameters. Open the link from your latest email on this device."
              );
            }
            return;
          }
        }

        if (!cancelled) router.replace("/auth/sync-nextauth");
      } catch (e) {
        console.error("[auth/callback]", e);
        if (!cancelled) setError("Something went wrong. Try signing in again.");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6">
        <div className="card !rounded-3xl !p-10 max-w-md text-center">
          <h1 className="font-serif text-2xl text-ink mb-3">
            Sign-in link didn&apos;t work
          </h1>
          <p className="text-sm text-ink-600 mb-8 leading-relaxed">{error}</p>
          <Link href="/auth" className="btn-primary !rounded-2xl inline-block">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="card !rounded-3xl !p-10 max-w-md text-center">
        <h1 className="font-serif text-2xl text-ink mb-3">
          Completing sign-in…
        </h1>
        <p className="text-sm text-ink-600">
          Hang tight — validating your magic link.
        </p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen flex items-center justify-center px-6">
          <p className="text-sm text-ink-600">Loading…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
