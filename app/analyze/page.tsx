import Link from "next/link";

export default function AnalyzePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-glow/15 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl text-center">
        <div className="glass rounded-2xl p-12 border-glow">
          <div className="text-5xl mb-6">🚀</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Analysis Engine
          </h1>
          <p className="text-zinc-400 mb-2">
            Upload your pitch deck and get feedback from three investor personas simultaneously.
          </p>
          <p className="text-sm text-zinc-600 mb-8">
            Module M04–M06 — Coming next session
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-xl glass border-glow border-glow-hover text-zinc-300 hover:text-white transition-all"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
