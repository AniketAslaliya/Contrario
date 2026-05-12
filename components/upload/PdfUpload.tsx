"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";
import { recordLastDeckAction } from "@/app/actions/profile";
import { MAX_PDF_BYTES } from "@/lib/pdf-constants";
import { extractPdfViaApiRoute } from "@/lib/parse-pdf-client";

import {
  STORAGE_PENDING_META,
  STORAGE_PENDING_TEXT,
} from "@/lib/analyze-input";

export function PdfUpload({ onPitchReady }: { onPitchReady?: () => void }) {
  const { status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    chars: number;
    pages: number;
    stored: boolean;
  } | null>(null);

  const runFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await extractPdfViaApiRoute(fd);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      try {
        sessionStorage.setItem(STORAGE_PENDING_TEXT, result.text);
        sessionStorage.setItem(
          STORAGE_PENDING_META,
          JSON.stringify({
            fileName: file.name,
            pages: result.numPages,
            bytes: result.byteLength,
            stored: Boolean(result.storedObjectPath),
            at: Date.now(),
          })
        );
      } catch {
        /* private mode / quota */
      }
      if (status === "authenticated" && result.storedObjectPath) {
        void recordLastDeckAction(result.storedObjectPath, file.name);
      }
      onPitchReady?.();

      setSuccess({
        chars: result.text.length,
        pages: result.numPages,
        stored: Boolean(result.storedObjectPath),
      });
    } finally {
      setBusy(false);
    }
  }, [onPitchReady, status]);

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    await runFile(f);
    e.target.value = "";
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    await runFile(f);
  };

  const mb = MAX_PDF_BYTES / (1024 * 1024);

  return (
    <div className="w-full max-w-xl mx-auto mt-12 text-left">
      <p className="text-xs text-ink-400 uppercase tracking-[0.12em] mb-3">
        Pitch deck
      </p>
      <div
        role="button"
        tabIndex={0}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver(false);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-300 ${
          dragOver
            ? "border-ink/40 bg-cream-100"
            : "border-cream-400 bg-cream-100/60"
        } ${busy ? "opacity-70 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={onInputChange}
          disabled={busy}
        />
        <p className="text-ink font-medium mb-2">
          {busy ? "Extracting text…" : "Drop a PDF here or click to browse"}
        </p>
        <p className="text-sm text-ink-400 mb-6">
          Max {mb}MB · parsed on the server ·{" "}
          {status === "authenticated"
            ? "Signed in — deck can be stored in Supabase Storage."
            : "No account needed to try — text only (no cloud storage)."}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-primary !rounded-2xl !py-3 !text-[13px]"
        >
          Choose PDF
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-4 rounded-2xl border border-persona-scale/30 bg-persona-scale/5 text-persona-scale text-sm">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 p-4 rounded-2xl border border-persona-reality/25 bg-persona-reality/5 text-ink text-sm">
          <span className="font-medium text-persona-reality">Ready.</span>{" "}
          {success.chars.toLocaleString()} characters from {success.pages} page
          {success.pages === 1 ? "" : "s"}.
          {success.stored ? " Copy saved to your workspace storage." : " "}
          Stored locally for analysis — nothing sent to the LLM yet.
        </div>
      ) : null}
    </div>
  );
}
