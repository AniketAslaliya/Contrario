"use client";

import Link from "next/link";

export default function AnalyzePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="pill mx-auto mb-8">Coming Soon</div>
        <h1 className="font-serif text-5xl md:text-6xl text-ink mb-6">
          Analysis <span className="italic text-muted-word">Engine</span>
        </h1>
        <p className="text-ink-400 text-base leading-relaxed mb-10">
          The three-persona parallel analysis engine is under construction.
          Upload your pitch deck and get streaming feedback from The Scale
          Chaser, The Conviction Buyer, and The Reality Check — simultaneously.
        </p>
        <Link href="/" className="btn-secondary">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
