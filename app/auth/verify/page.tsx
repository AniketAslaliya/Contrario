"use client";

import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="card !rounded-3xl !p-12 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-cream-300 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-persona-conviction"
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
        <h1 className="font-serif text-3xl text-ink mb-3">
          Check your email
        </h1>
        <p className="text-sm text-ink-400 mb-8 leading-relaxed">
          We sent you a sign-in link. Click the link in your email to continue
          to Contrario.
        </p>
        <Link
          href="/auth"
          className="text-sm text-ink font-medium hover:text-persona-scale transition-colors duration-300"
        >
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}
