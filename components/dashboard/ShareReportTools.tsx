"use client";

import { useState } from "react";
import { createShareReportAction } from "@/app/dashboard/share-report-action";

type Props = { analysisId: string };

export function ShareReportTools({ analysisId }: Props) {
  const [expiry, setExpiry] = useState<"7" | "30" | "never">("30");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function createLink() {
    setBusy(true);
    setMessage(null);
    setUrl(null);
    try {
      const r = await createShareReportAction({ analysisId, expiry });
      if (r.ok) {
        setUrl(r.url);
        try {
          await navigator.clipboard.writeText(r.url);
          setMessage("Link copied to clipboard.");
        } catch {
          setMessage("Link created — copy from below.");
        }
      } else {
        setMessage(r.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cream-400 bg-cream-100/60 px-4 py-4 md:px-5 w-full">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-2">
        Share report
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <label className="flex-1 text-sm">
          <span className="text-ink-400 text-xs block mb-1">Link expires</span>
          <select
            value={expiry}
            onChange={(e) =>
              setExpiry(e.target.value as "7" | "30" | "never")
            }
            className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm text-ink"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="never">No expiry</option>
          </select>
        </label>
        <button
          type="button"
          onClick={createLink}
          disabled={busy}
          className="btn-secondary !rounded-xl !py-2.5 whitespace-nowrap disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create public link"}
        </button>
      </div>
      {message ? (
        <p className="text-xs text-ink-500 mt-3">{message}</p>
      ) : null}
      {url ? (
        <p className="text-xs text-ink-600 mt-2 break-all font-mono bg-cream-200/50 rounded-lg px-2 py-2">
          {url}
        </p>
      ) : null}
    </div>
  );
}
