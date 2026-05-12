"use client";

import { useState } from "react";

type Props = { analysisId: string };

export function MemoGeneratorButton({ analysisId }: Props) {
  const [busy, setBusy] = useState(false);
  const [memo, setMemo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/analyses/${analysisId}/memo`, {
        method: "POST",
      });
      const j = (await res.json()) as { memo?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Request failed");
      setMemo(j.memo ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!memo) return;
    void navigator.clipboard.writeText(memo);
  }

  return (
    <div className="rounded-2xl border border-cream-400 bg-cream-100/60 p-4 md:p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
          Investment memo (draft)
        </p>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="btn-secondary !py-2 !text-sm disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate memo"}
        </button>
      </div>
      {err ? <p className="text-sm text-red-700 mb-2">{err}</p> : null}
      {memo ? (
        <>
          <textarea
            readOnly
            className="w-full min-h-[240px] rounded-xl border border-cream-400 bg-cream-100/80 px-3 py-2 text-sm text-ink font-mono leading-relaxed"
            value={memo}
            onChange={() => {}}
          />
          <button
            type="button"
            onClick={copy}
            className="mt-2 text-sm text-ink-500 hover:text-ink underline"
          >
            Copy Markdown
          </button>
        </>
      ) : (
        <p className="text-sm text-ink-500">
          One-page structured memo from the three persona write-ups (editable
          after copy).
        </p>
      )}
    </div>
  );
}
