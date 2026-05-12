import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-brand-900/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md text-center">
        <div className="glass rounded-2xl p-10 border-glow">
          <div className="w-20 h-20 rounded-full bg-brand-900/30 border border-brand-700/30 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-brand-400"
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

          <h1 className="text-2xl font-bold text-white mb-3">
            Check your email
          </h1>
          <p className="text-zinc-400 mb-6">
            A magic link has been sent to your email address. Click the link to
            sign in to Contrario.
          </p>

          <div className="space-y-3">
            <Link
              href="/auth"
              className="block px-4 py-3 rounded-xl bg-surface-2 border border-white/[0.06] text-zinc-300 text-sm hover:bg-surface-3 transition-all"
            >
              ← Back to sign in
            </Link>
            <Link
              href="/analyze"
              className="block text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Or continue as guest →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
