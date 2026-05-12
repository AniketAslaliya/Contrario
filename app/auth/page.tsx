"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        window.location.href = result.url || "/onboarding";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back link */}
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

        {/* Auth Card */}
        <div className="card !rounded-3xl !p-10">
          {/* Logo */}
          <div className="mb-8">
            <span className="font-serif text-3xl text-ink tracking-tight">
              Contrario
            </span>
            <p className="text-sm text-ink-400 mt-2">
              Sign in to save your analyses and track improvement.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            id="btn-google-signin"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-cream-100 border border-cream-400 text-ink font-medium text-sm transition-all duration-300 hover:bg-cream-50 hover:border-cream-500 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="h-[1px] flex-1 bg-cream-400" />
            <span className="text-xs text-ink-300 uppercase tracking-[0.15em]">
              or
            </span>
            <div className="h-[1px] flex-1 bg-cream-400" />
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ink-400 mb-2"
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
              className="w-full px-4 py-3 rounded-2xl bg-cream-100 border border-cream-400 text-ink placeholder:text-ink-300 focus:outline-none focus:border-ink-400 focus:ring-1 focus:ring-ink-400/20 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              id="btn-email-signin"
              className="btn-primary w-full mt-4 !rounded-2xl"
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
            <div className="mt-4 p-3 rounded-xl bg-persona-scale/10 border border-persona-scale/20 text-persona-scale text-sm">
              {error}
            </div>
          )}

          {/* Guest mode */}
          <div className="mt-8 pt-6 border-t border-cream-400 text-center">
            <p className="text-sm text-ink-300 mb-2">Just want to try it?</p>
            <Link
              href="/analyze"
              className="text-sm text-ink font-medium hover:text-persona-scale transition-colors duration-300"
            >
              Continue as guest (1 free analysis) →
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-ink-300 mt-8">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </main>
  );
}
