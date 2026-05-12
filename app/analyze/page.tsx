"use client";

import Link from "next/link";
import { AnalyzeWorkspace } from "./AnalyzeWorkspace";

export default function AnalyzePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <div className="max-w-2xl text-center mb-6">
        <div className="pill mx-auto mb-8">Analyze</div>
        <h1 className="font-serif text-5xl md:text-6xl text-ink mb-6">
          Three lenses on your <span className="italic text-muted-word">pitch</span>
        </h1>
        <p className="text-ink-400 text-base leading-relaxed">
          Upload a PDF or paste your narrative. We extract the text and run all
          three personas in parallel.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 text-sm text-ink-400 hover:text-ink transition-colors"
        >
          ← Back to home
        </Link>
      </div>

      <AnalyzeWorkspace />
    </main>
  );
}
