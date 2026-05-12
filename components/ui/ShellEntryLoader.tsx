"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "visible" | "hiding" | "done";

/**
 * Full-viewport branded overlay for first paint / slow JS.
 * Respects a minimum display time so it never flashes, and a hard cap so it never traps users.
 */
export function ShellEntryLoader() {
  const [phase, setPhase] = useState<Phase>("visible");
  const startedAt = useRef(performance.now());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const minMs = 520;
    const maxMs = 3800;
    const exitDelayMs = 420;

    let removed = false;

    const toHiding = () => {
      if (removed) return;
      removed = true;
      setPhase("hiding");
      window.setTimeout(() => setPhase("done"), exitDelayMs);
    };

    const scheduleHide = () => {
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, minMs - elapsed);
      window.setTimeout(toHiding, wait);
    };

    const onLoad = () => scheduleHide();

    if (document.readyState === "complete") {
      scheduleHide();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    const hardCap = window.setTimeout(() => {
      window.removeEventListener("load", onLoad);
      scheduleHide();
    }, maxMs);

    return () => {
      window.clearTimeout(hardCap);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase === "visible"}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-200 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        phase === "hiding" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center max-w-sm">
        <div className="font-serif text-4xl sm:text-5xl text-ink tracking-tight leading-none">
          Contrario
        </div>
        <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-400">
          Three investors · One deck · Zero consensus
        </p>
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-persona-scale animate-shell-dot" />
          <span
            className="h-2.5 w-2.5 rounded-full bg-persona-conviction animate-shell-dot [animation-delay:150ms]"
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-persona-reality animate-shell-dot [animation-delay:300ms]"
          />
        </div>
        <p className="text-sm text-ink-500 leading-relaxed">
          Loading your workspace…
        </p>
      </div>
    </div>
  );
}
