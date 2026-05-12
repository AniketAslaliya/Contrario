/** Static HTML mockup — sample conflict output (no image asset). */
export function ConflictMapPreview() {
  return (
    <section className="py-20 px-6 bg-cream-50/80 border-y border-cream-400/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-ink-600 mb-3">
            Sample output
          </p>
          <h2 className="font-serif text-3xl text-ink">
            The conflict is the signal.
          </h2>
          <p className="text-ink-600 mt-3 max-w-xl mx-auto text-sm">
            When two investors flag the same slide differently, that&apos;s your
            positioning choice. When all three agree — that&apos;s your blocker.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-persona-scale/30 bg-cream-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden>🔴</span>
              <span className="text-xs font-semibold text-persona-scale uppercase tracking-wider">
                Scale Chaser
              </span>
              <span className="ml-auto text-2xl font-bold text-persona-scale">
                6
              </span>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              &ldquo;TAM cited as ₹800Cr but no bottom-up validation. If UPI
              distribution is the wedge, show penetration curves — not a Statista
              screenshot.&rdquo;
            </p>
            <div className="mt-3 text-xs font-semibold text-persona-conviction">
              CONDITIONAL
            </div>
          </div>
          <div className="rounded-xl border border-persona-conviction/30 bg-cream-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden>🟡</span>
              <span className="text-xs font-semibold text-persona-conviction uppercase tracking-wider">
                Conviction Buyer
              </span>
              <span className="ml-auto text-2xl font-bold text-persona-conviction">
                8
              </span>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              &ldquo;Founder has lived this problem. 3 years in the industry
              before building is the India insight I look for. The ₹499 price point
              shows you&apos;ve talked to real users.&rdquo;
            </p>
            <div className="mt-3 text-xs font-semibold text-persona-reality">
              INVEST
            </div>
          </div>
          <div className="rounded-xl border border-persona-reality/30 bg-cream-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden>🟢</span>
              <span className="text-xs font-semibold text-persona-reality uppercase tracking-wider">
                Reality Check
              </span>
              <span className="ml-auto text-2xl font-bold text-persona-reality">
                5
              </span>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              &ldquo;40% D30 retention sounds good but what&apos;s D7? CAC
              isn&apos;t mentioned once. You&apos;re burning cash on growth before
              you&apos;ve proven the loop.&rdquo;
            </p>
            <div className="mt-3 text-xs font-semibold text-persona-scale">
              PASS
            </div>
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-cream-400 border-l-4 border-l-persona-scale bg-cream-100/90 p-6 md:p-7 text-left shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mb-2 font-sans">
            All 3 flagged this
          </p>
          <p className="font-serif text-lg text-ink leading-snug">
            &ldquo;No CAC or payback period mentioned. This is the single blocker
            across all three investor lenses.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
