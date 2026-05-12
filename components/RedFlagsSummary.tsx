import type { RedFlagRow } from "@/lib/synthesis/post-analysis";

type Props = {
  flags: RedFlagRow[];
  visible?: boolean;
};

export function RedFlagsSummary({ flags, visible = true }: Props) {
  if (!visible || flags.length === 0) return null;

  return (
    <section className="mt-10 w-full rounded-2xl border border-persona-scale/30 bg-persona-scale/[0.06] px-5 py-6 md:px-8 md:py-8">
      <div className="pill mb-4 border-persona-scale/30 bg-persona-scale/10 text-persona-scale">
        Consensus red flags
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2">
        The three things everyone <span className="italic">flagged</span>
      </h2>
      <p className="text-sm text-ink-400 mb-6 max-w-2xl">
        Fixes are one-liners you can ship before your next investor meeting.
      </p>
      <ul className="space-y-4">
        {flags.map((f, i) => (
          <li
            key={i}
            className="rounded-xl border border-persona-scale/20 bg-cream-100/80 px-4 py-3"
          >
            <p className="font-medium text-ink text-sm mb-1">{f.issue}</p>
            <p className="text-sm text-persona-reality">
              <span className="font-medium text-ink-400">Fix · </span>
              {f.fix}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
