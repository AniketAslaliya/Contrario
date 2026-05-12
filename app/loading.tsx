/** Instant fallback while route segments stream during navigation */
export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-200 px-6">
      <div className="flex flex-col items-center gap-8 text-center max-w-sm">
        <div className="font-serif text-4xl sm:text-5xl text-ink tracking-tight leading-none">
          Contrario
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-400">
          Three investors · One deck · Zero consensus
        </p>
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-persona-scale animate-shell-dot" />
          <span className="h-2.5 w-2.5 rounded-full bg-persona-conviction animate-shell-dot [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 rounded-full bg-persona-reality animate-shell-dot [animation-delay:300ms]" />
        </div>
        <p className="text-sm text-ink-500">Loading…</p>
      </div>
    </div>
  );
}
