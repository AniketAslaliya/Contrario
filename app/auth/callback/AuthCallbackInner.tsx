"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * PKCE / magic-link redirects must exchange tokens in the **browser** (code_verifier).
 * Also handles implicit tokens in the URL **hash** (access_token + refresh_token),
 * which `useSearchParams()` does not expose — a common reason email login “does nothing”.
 */
export function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createSupabaseBrowserClient();

        const errorParam = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");
        if (errorParam) {
          if (!cancelled) {
            setError(
              errorDesc?.replace(/\+/g, " ") ||
                errorParam ||
                "Sign-in was cancelled or failed."
            );
          }
          return;
        }

        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const token = searchParams.get("token");
        const typeRaw = searchParams.get("type");
        const type = typeRaw as EmailOtpType | null;

        /* 1) Fragment tokens (implicit / older magic-link shape) */
        if (typeof window !== "undefined" && window.location.hash?.length > 1) {
          const hp = new URLSearchParams(
            window.location.hash.replace(/^#/, "")
          );
          const access_token = hp.get("access_token");
          const refresh_token = hp.get("refresh_token");
          if (access_token && refresh_token) {
            const { error: sessErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessErr) {
              console.error("[auth/callback] setSession(hash)", sessErr.message);
              if (!cancelled) {
                setError(
                  "Could not complete sign-in from this link. Request a new magic link."
                );
              }
              return;
            }
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );
            if (!cancelled) router.replace("/auth/sync-nextauth");
            return;
          }
        }

        /* 2) PKCE authorization code */
        if (code) {
          const { error: exErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            console.error("[auth/callback] exchangeCode", exErr.message);
            if (!cancelled) {
              setError(
                "This sign-in link is invalid or expired. Request a new one from the sign-in page."
              );
            }
            return;
          }
          if (!cancelled) router.replace("/auth/sync-nextauth");
          return;
        }

        /* 3) Email OTP verify — token_hash or token + type */
        if (type) {
          if (tokenHash) {
            const { error: otpErr } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            });
            if (otpErr) {
              console.error("[auth/callback] verifyOtp(hash)", otpErr.message);
              if (!cancelled) {
                setError(
                  "This sign-in link is invalid or expired. Request a new one from the sign-in page."
                );
              }
              return;
            }
            if (!cancelled) router.replace("/auth/sync-nextauth");
            return;
          }
          if (token) {
            const email = searchParams.get("email");
            if (
              email &&
              (type === "email" || type === "signup")
            ) {
              const { error: otpErr } = await supabase.auth.verifyOtp({
                email,
                token,
                type,
              });
              if (otpErr) {
                console.error(
                  "[auth/callback] verifyOtp(email+token)",
                  otpErr.message
                );
                if (!cancelled) {
                  setError(
                    "This sign-in link is invalid or expired. Request a new one from the sign-in page."
                  );
                }
                return;
              }
              if (!cancelled) router.replace("/auth/sync-nextauth");
              return;
            }
            if (!cancelled) {
              setError(
                "This link is missing required parameters. Use the latest email link on this device."
              );
            }
            return;
          }
        }

        /* 4) Session may already exist (detectSessionInUrl / prior tab) */
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          if (!cancelled) router.replace("/auth/sync-nextauth");
          return;
        }

        if (!cancelled) {
          setError(
            "Missing sign-in parameters. Open the link from your latest email on this device and confirm Supabase redirect URLs include this exact origin + /auth/callback."
          );
        }
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
