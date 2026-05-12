import type { ConflictMapData } from "@/lib/synthesis/post-analysis";

type Props = {
  data: ConflictMapData;
  visible?: boolean;
};

export function ConflictMap({ data, visible = true }: Props) {
  if (!visible) return null;

  const has =
    data.green.length > 0 ||
    data.red.length > 0 ||
    data.yellow.length > 0;

  return (
    <section className="mt-12 w-full border-t border-cream-400 pt-10">
      <div className="pill mx-auto mb-6">Conflict map</div>
      <h2 className="font-serif text-3xl md:text-4xl text-ink text-center mb-2">
        Where investors <span className="italic text-muted-word">align & clash</span>
      </h2>
      <p className="text-center text-sm text-ink-400 mb-8 max-w-2xl mx-auto">
        Green = all three agree it&apos;s a strength. Red = all three flag a risk. Yellow
        = mixed signals (typically two of three).
      </p>

      {!has ? (
        <p className="text-center text-sm text-ink-400">
          No conflict zones could be derived — try a longer pitch excerpt.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <ZoneCard
            title="All agree — strengths"
            emoji="🟢"
            accent="border-persona-reality/40 bg-persona-reality/5"
            items={data.green}
          />
          <ZoneCard
            title="All agree — red risks"
            emoji="🔴"
            accent="border-persona-scale/40 bg-persona-scale/5"
            items={data.red}
          />
          <ZoneCard
            title="Split / 2-of-3"
            emoji="🟡"
            accent="border-persona-conviction/40 bg-persona-conviction/5"
            items={data.yellow}
          />
        </div>
      )}
    </section>
  );
}

function ZoneCard({
  title,
  emoji,
  accent,
  items,
}: {
  title: string;
  emoji: string;
  accent: string;
  items: string[];
}) {
  return (
    <div className={`rounded-2xl border-2 p-4 md:p-5 ${accent}`}>
      <h3 className="font-medium text-ink text-sm mb-3 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      <ul className="space-y-2 text-sm text-ink-600 leading-relaxed">
        {items.length === 0 ? (
          <li className="text-ink-300">—</li>
        ) : (
          items.map((x, i) => (
            <li key={i} className="pl-1">
              {x}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
