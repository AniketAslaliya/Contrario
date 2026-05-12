"use client";

import Link from "next/link";
import { useState } from "react";
import { extractPdfViaApiRoute } from "@/lib/parse-pdf-client";
import {
  STORAGE_PENDING_META,
  STORAGE_PENDING_TEXT,
} from "@/lib/analyze-input";

type Row = { name: string; ok: boolean; pages?: number; error?: string };

export function BatchUploadClient() {
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  async function run(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const out: Row[] = [];
    const list = Array.from(files).slice(0, 20);
    for (const file of list) {
      const fd = new FormData();
      fd.append("file", file);
      const r = await extractPdfViaApiRoute(fd);
      if (r.ok) {
        out.push({
          name: file.name,
          ok: true,
          pages: r.numPages,
        });
        try {
          sessionStorage.setItem(STORAGE_PENDING_TEXT, r.text);
          sessionStorage.setItem(
            STORAGE_PENDING_META,
            JSON.stringify({
              fileName: file.name,
              pages: r.numPages,
            })
          );
        } catch {
          /* ignore */
        }
      } else {
        out.push({
          name: file.name,
          ok: false,
          error: r.message,
        });
      }
      setRows([...out]);
    }
    setBusy(false);
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <label className="block rounded-2xl border border-dashed border-cream-400 bg-cream-100/50 px-6 py-10 text-center cursor-pointer hover:border-ink/20 transition-colors">
        <input
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => run(e.target.files)}
        />
        <span className="text-sm text-ink">
          {busy ? "Extracting…" : "Drop up to 20 PDFs, or click to select"}
        </span>
      </label>

      {rows.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {rows.map((r, i) => (
            <li
              key={`${r.name}-${i}`}
              className="flex justify-between gap-4 rounded-xl border border-cream-400/80 bg-cream-100/60 px-4 py-3"
            >
              <span className="truncate text-ink">{r.name}</span>
              {r.ok ? (
                <span className="text-ink-500 text-xs shrink-0">
                  {r.pages} pp ·{" "}
                  <Link href="/analyze" className="underline text-ink">
                    Run last extracted →
                  </Link>
                </span>
              ) : (
                <span className="text-red-700 text-xs">{r.error}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-ink-400 leading-relaxed">
        Decks are processed one after another. Each successful extract updates
        session storage so the next step opens on Analyze with the last deck loaded.
        For a full queue product, wire each row to a persisted job.
      </p>
    </div>
  );
}
