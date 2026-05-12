"use client";

import Link from "next/link";
import type { AnalysisRow } from "@/lib/analysis-store";
import { toggleAnalysisStarAction } from "@/app/dashboard/shortlist/shortlist-actions";

export function ShortlistTable({ rows }: { rows: AnalysisRow[] }) {
  async function toggleStar(id: string, starred: boolean) {
    await toggleAnalysisStarAction({ analysisId: id, starred: !starred });
    window.location.reload();
  }

  function downloadCsv() {
    const header = ["rank", "title", "avg_score", "starred", "top_red_flag"].join(",");
    const lines = rows.map((r, i) => {
      const flag =
        r.synthesis?.redFlags[0]?.issue?.replace(/,/g, ";") ?? "";
      return [
        i + 1,
        `"${(r.title || "").replace(/"/g, '""')}"`,
        r.avg_score ?? "",
        r.starred ? "yes" : "no",
        `"${flag}"`,
      ].join(",");
    });
    const blob = new Blob([header + "\n" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "contrario-shortlist.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No org-tagged analyses yet. Founders linked to your workspace will save with org context.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={downloadCsv}
          className="text-xs text-ink-500 hover:text-ink underline"
        >
          Export CSV
        </button>
      </div>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-cream-400 text-ink-400 text-xs uppercase">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Deck</th>
            <th className="py-2 pr-2">Score</th>
            <th className="py-2 pr-2">Top red flag</th>
            <th className="py-2">★</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-b border-cream-400/60">
              <td className="py-3 pr-2 tabular-nums text-ink-400">{i + 1}</td>
              <td className="py-3 pr-2">
                <Link
                  href={`/dashboard/analysis/${r.id}`}
                  className="text-ink hover:underline font-medium"
                >
                  {r.title}
                </Link>
              </td>
              <td className="py-3 pr-2 tabular-nums">{r.avg_score ?? "—"}</td>
              <td className="py-3 pr-2 text-ink-600 max-w-xs truncate">
                {r.synthesis?.redFlags[0]?.issue ?? "—"}
              </td>
              <td className="py-3">
                <button
                  type="button"
                  onClick={() => toggleStar(r.id, r.starred)}
                  className="text-lg leading-none"
                  aria-label="Toggle star"
                >
                  {r.starred ? "★" : "☆"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
