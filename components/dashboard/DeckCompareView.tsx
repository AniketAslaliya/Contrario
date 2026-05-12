import type { DeckCompareResult } from "@/lib/deck-compare";
import { displayNameForPersona } from "@/lib/personas";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";

type Props = { data: DeckCompareResult };

export function DeckCompareView({ data }: Props) {
  const { v1, v2 } = data;
  const d1 = new Date(v1.created_at);
  const d2 = new Date(v2.created_at);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 px-0 pb-16">
      <header className="text-center">
        <p className="text-xs text-ink-400 uppercase tracking-[0.12em] mb-2">
          Deck improvement
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">
          v1 → v2 <span className="italic text-muted-word">delta</span>
        </h1>
        <p className="text-sm text-ink-400 mt-3">
          <span className="font-medium text-ink-500">{v1.title}</span>
          <span className="mx-2">·</span>
          {d1.toLocaleString(undefined, { dateStyle: "medium" })} vs{" "}
          {d2.toLocaleString(undefined, { dateStyle: "medium" })}
        </p>
        {data.mostImprovedPersona ? (
          <p className="mt-4 inline-flex rounded-full border border-persona-reality/30 bg-persona-reality/5 px-4 py-2 text-sm text-ink">
            Most improved lens:{" "}
            <span className="ml-2 font-medium">
              {displayNameForPersona(data.mostImprovedPersona)}
            </span>
            {data.delta[data.mostImprovedPersona] != null ? (
              <span className="ml-2 text-persona-reality tabular-nums font-medium">
                +{data.delta[data.mostImprovedPersona]}
              </span>
            ) : null}
          </p>
        ) : null}
      </header>

      <section className="space-y-6">
        <h2 className="font-serif text-xl text-ink text-center">
          Score movement <span className="text-ink-400 text-base">( /10 )</span>
        </h2>
        <div className="space-y-8">
          {PERSONA_IDS.map((id) => (
            <PersonaDeltaCard key={id} id={id} data={data} />
          ))}
        </div>
      </section>

      {(data.newRedFlags.length > 0 || data.resolvedRedFlags.length > 0) && (
        <section className="grid md:grid-cols-2 gap-6">
          {data.newRedFlags.length > 0 ? (
            <div className="rounded-2xl border border-persona-scale/25 bg-persona-scale/[0.06] p-5">
              <h3 className="text-sm font-medium text-persona-scale mb-3">
                New consensus flags (v2)
              </h3>
              <ul className="space-y-2 text-sm text-ink-600">
                {data.newRedFlags.map((f, i) => (
                  <li key={i}>{f.issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.resolvedRedFlags.length > 0 ? (
            <div className="rounded-2xl border border-persona-reality/25 bg-persona-reality/5 p-5">
              <h3 className="text-sm font-medium text-persona-reality mb-3">
                Resolved vs v1
              </h3>
              <ul className="space-y-2 text-sm text-ink-600">
                {data.resolvedRedFlags.map((f, i) => (
                  <li key={i}>{f.issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      <section className="rounded-2xl border border-cream-400 bg-cream-100/50 p-5 md:p-6">
        <h3 className="text-sm font-medium text-ink mb-4">
          Key concern — then vs now
        </h3>
        <div className="space-y-4">
          {PERSONA_IDS.map((id) => {
            const prev = data.keyConcernV1[id];
            const next = data.keyConcernV2[id];
            if (!prev && !next) return null;
            return (
              <div
                key={id}
                className="border-t border-cream-400/80 pt-4 first:border-0 first:pt-0"
              >
                <p className="text-xs text-ink-400 mb-1">
                  {displayNameForPersona(id)}
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="text-ink-500">
                    <span className="text-[11px] uppercase text-ink-400 block mb-1">
                      v1
                    </span>
                    {prev || "—"}
                  </div>
                  <div className="text-ink">
                    <span className="text-[11px] uppercase text-ink-400 block mb-1">
                      v2
                    </span>
                    {next || "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PersonaDeltaCard({
  id,
  data,
}: {
  id: PersonaId;
  data: DeckCompareResult;
}) {
  const s1 = data.scoresV1[id];
  const s2 = data.scoresV2[id];
  const d = data.delta[id];
  const pct1 = s1 != null ? (s1 / 10) * 100 : 0;
  const pct2 = s2 != null ? (s2 / 10) * 100 : 0;

  return (
    <div className="rounded-2xl border border-cream-400 bg-cream-100/70 p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-medium text-ink text-sm">
          {displayNameForPersona(id)}
        </h3>
        {d != null ? (
          <span
            className={`tabular-nums text-sm font-medium ${
              d > 0
                ? "text-persona-reality"
                : d < 0
                  ? "text-persona-scale"
                  : "text-ink-400"
            }`}
          >
            {d > 0 ? "+" : ""}
            {d}
          </span>
        ) : (
          <span className="text-xs text-ink-400">—</span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] text-ink-400 mb-1">
            <span>v1</span>
            <span className="tabular-nums">{s1 ?? "—"}</span>
          </div>
          <div className="h-2 rounded-full bg-cream-400/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-ink/25"
              style={{ width: `${pct1}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-ink-400 mb-1">
            <span>v2</span>
            <span className="tabular-nums">{s2 ?? "—"}</span>
          </div>
          <div className="h-2 rounded-full bg-cream-400/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
