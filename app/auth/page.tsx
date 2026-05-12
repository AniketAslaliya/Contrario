"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch {
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("email-login", {
        email,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      if (result?.error) {
        setError("Invalid email. Please try again.");
      } else if (result?.ok) {
        // Credentials-based login succeeds immediately
        window.location.href = result.url || "/onboarding";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-brand-900/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-accent-glow/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to home
        </Link>

        {/* Auth card */}
        <div className="glass rounded-2xl p-8 border-glow">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-glow flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Contrario
            </span>
          </div>
          <p className="text-sm text-zinc-500 mb-8">
            Sign in to save your analyses and track deck improvement.
          </p>

          {emailSent ? (
            /* Email sent state */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-brand-900/30 border border-brand-700/30 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Check your email
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                We sent a magic link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                id="btn-google-signin"
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-medium transition-all hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="h-[1px] flex-1 bg-white/[0.06]" />
                <span className="text-xs text-zinc-600 uppercase tracking-widest">
                  or
                </span>
                <div className="h-[1px] flex-1 bg-white/[0.06]" />
              </div>

              {/* Email Sign In */}
              <form onSubmit={handleEmailSignIn}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-white/[0.06] text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  id="btn-email-signin"
                  className="w-full mt-4 px-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 text-white font-semibold transition-all hover:shadow-[0_0_30px_rgba(92,124,250,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Continue with Email"
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Guest mode */}
              <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-sm text-zinc-500 mb-2">
                  Just want to try it?
                </p>
                <Link
                  href="/analyze"
                  className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Continue as guest (1 free analysis) →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-700 mt-6">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </main>
  );
}
