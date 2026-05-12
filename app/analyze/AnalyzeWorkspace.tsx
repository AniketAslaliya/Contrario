"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ANALYSIS_INPUT_MIN_CHARS,
  GUEST_ANALYSIS_KEY,
  PASTE_MIN_CHARS,
  STORAGE_INDIA_MODE,
  STORAGE_PENDING_META,
  STORAGE_PENDING_TEXT,
} from "@/lib/analyze-input";
import {
  averageScoreFromOutputs,
  extractScoreFromMarkdown,
} from "@/lib/parse-persona-output";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import { detectSlidesFromPitch } from "@/lib/slide-split";
import { saveAnalysisAction } from "@/app/analyze/save-analysis-action";
import { ConflictMap } from "@/components/conflict-map/ConflictMap";
import type { PersonaStreamStatus } from "@/components/persona-card/PersonaStreamColumn";
import { PersonaStreamColumn } from "@/components/persona-card/PersonaStreamColumn";
import { PdfUpload } from "@/components/upload/PdfUpload";
import { TextInput } from "@/components/upload/TextInput";

type Tab = "pdf" | "paste";

const emptyOutputs = (): Record<PersonaId, string> => ({
  "scale-chaser": "",
  "conviction-buyer": "",
  "reality-check": "",
});

const idlePersonaStatus = (): Record<PersonaId, PersonaStreamStatus> => ({
  "scale-chaser": "idle",
  "conviction-buyer": "idle",
  "reality-check": "idle",
});

const streamingPersonaStatus = (): Record<PersonaId, PersonaStreamStatus> => ({
  "scale-chaser": "streaming",
  "conviction-buyer": "streaming",
  "reality-check": "streaming",
});

const donePersonaStatus = (): Record<PersonaId, PersonaStreamStatus> => ({
  "scale-chaser": "done",
  "conviction-buyer": "done",
  "reality-check": "done",
});

const emptyErrs = (): Record<PersonaId, string | null> => ({
  "scale-chaser": null,
  "conviction-buyer": null,
  "reality-check": null,
});

function isPersonaId(s: string): s is PersonaId {
  return (PERSONA_IDS as readonly string[]).includes(s);
}

function readPendingMeta(): { title: string; source: "paste" | "pdf" } {
  if (typeof window === "undefined") {
    return { title: "Pitch", source: "paste" };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_PENDING_META);
    if (!raw) return { title: "Pitch", source: "paste" };
    const m = JSON.parse(raw) as {
      source?: string;
      fileName?: string;
      pages?: number;
    };
    if (m.fileName && typeof m.fileName === "string") {
      return {
        title: m.fileName.replace(/\.pdf$/i, "") || "Deck",
        source: "pdf",
      };
    }
    if (m.pages != null && typeof m.pages === "number") {
      return { title: "Uploaded deck", source: "pdf" };
    }
    return { title: "Pasted pitch", source: "paste" };
  } catch {
    return { title: "Pitch", source: "paste" };
  }
}

function parseDataLine(line: string): Record<string, unknown> | null {
  const t = line.trimStart();
  if (!t.startsWith("data:")) return null;
  const raw = t.slice(5).trimStart();
  if (!raw || raw === "[DONE]") return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function AnalyzeWorkspace() {
  const { status, data: sessionData } = useSession();
  const [tab, setTab] = useState<Tab>("pdf");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [personaOutputs, setPersonaOutputs] = useState(emptyOutputs);
  const [personaStatus, setPersonaStatus] = useState(idlePersonaStatus);
  const [err, setErr] = useState(emptyErrs);
  const [banner, setBanner] = useState<string | null>(null);
  const [inputRev, setInputRev] = useState(0);
  const [guestRev, setGuestRev] = useState(0);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [slideHint, setSlideHint] = useState<number | null>(null);
  const [indiaMode, setIndiaMode] = useState(false);
  const [recentDeck, setRecentDeck] = useState<{
    file_name: string;
    at: string;
    download_url: string | null;
  } | null>(null);
  const [displayNameHint, setDisplayNameHint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_INDIA_MODE);
      setIndiaMode(v === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setRecentDeck(null);
      setDisplayNameHint(null);
      return;
    }
    let cancelled = false;
    fetch("/api/profile/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          display_name?: string | null;
          last_deck?: {
            file_name: string;
            at: string;
            download_url: string | null;
          } | null;
        } | null) => {
          if (cancelled || !data) return;
          if (data.display_name?.trim()) {
            setDisplayNameHint(data.display_name.trim());
          }
          if (data.last_deck?.file_name) setRecentDeck(data.last_deck);
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, inputRev]);

  const workspaceGreeting = useMemo(() => {
    if (displayNameHint) return displayNameHint;
    const n = sessionData?.user?.name?.trim();
    if (n) return n.split(/\s+/)[0] ?? n;
    const em = sessionData?.user?.email;
    if (em?.includes("@")) return em.split("@")[0] ?? "there";
    return "there";
  }, [displayNameHint, sessionData?.user?.email, sessionData?.user?.name]);

  const scores = useMemo(() => {
    const s: Record<PersonaId, string | null> = {
      "scale-chaser": null,
      "conviction-buyer": null,
      "reality-check": null,
    };
    for (const id of PERSONA_IDS) {
      s[id] = extractScoreFromMarkdown(personaOutputs[id]);
    }
    return s;
  }, [personaOutputs]);

  const guestBlocked = useMemo(() => {
    void guestRev;
    if (typeof window === "undefined") return false;
    if (status === "authenticated") return false;
    try {
      const n = Number(localStorage.getItem(GUEST_ANALYSIS_KEY) || "0");
      return n >= 1;
    } catch {
      return false;
    }
  }, [status, guestRev]);

  const readPitchText = useCallback(() => {
    try {
      return sessionStorage.getItem(STORAGE_PENDING_TEXT)?.trim() ?? "";
    } catch {
      return "";
    }
  }, []);

  const canRun = useCallback(() => {
    void inputRev;
    const text = readPitchText();
    if (text.length < ANALYSIS_INPUT_MIN_CHARS) return false;
    if (tab === "paste" && text.length < PASTE_MIN_CHARS) return false;
    return true;
  }, [readPitchText, tab, inputRev]);

  const bumpInput = useCallback(() => setInputRev((n) => n + 1), []);

  const runAnalysis = useCallback(async () => {
    setBanner(null);
    const text = readPitchText();
    if (text.length < ANALYSIS_INPUT_MIN_CHARS) {
      setBanner(
        `Add at least ${ANALYSIS_INPUT_MIN_CHARS} characters (extract a PDF or paste a pitch).`
      );
      return;
    }
    if (tab === "paste" && text.length < PASTE_MIN_CHARS) {
      setBanner(`Paste path needs at least ${PASTE_MIN_CHARS} characters.`);
      return;
    }
    if (guestBlocked) {
      setBanner("Sign in to run another analysis — guests get one free run.");
      return;
    }

    setIsAnalyzing(true);
    setPersonaOutputs(emptyOutputs());
    setPersonaStatus(streamingPersonaStatus());
    setErr(emptyErrs());
    setSynthesis(null);
    setSynthesisError(null);
    setSlideHint(null);

    const slideOutline = detectSlidesFromPitch(text);
    if (slideOutline && slideOutline.length >= 2) {
      setSlideHint(slideOutline.length);
    }

    const localOutputs = emptyOutputs();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          text,
          slides: slideOutline ?? undefined,
          indiaContext: indiaMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({
          error: "Unknown error",
        }));
        throw new Error(
          typeof (errJson as { error?: string }).error === "string"
            ? (errJson as { error: string }).error
            : "Analysis failed"
        );
      }

      if (!res.body) {
        throw new Error("No response body — streaming not supported in this browser.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        if (done) {
          buffer += decoder.decode();
        }

        const lines = buffer.split(/\r?\n/);
        if (done) {
          buffer = "";
        } else {
          buffer = lines.pop() ?? "";
        }

        for (const line of lines) {
          const event = parseDataLine(line);
          if (!event) continue;

          if (event.fatal && event.error != null) {
            throw new Error(String(event.error));
          }
          if (typeof event.synthesisError === "string") {
            setSynthesisError(event.synthesisError);
          }

          const personaIdRaw = event.persona != null ? String(event.persona) : "";
          if (personaIdRaw && isPersonaId(personaIdRaw)) {
            const pid = personaIdRaw;
            if (typeof event.delta === "string" && event.delta.length > 0) {
              localOutputs[pid] = (localOutputs[pid] ?? "") + event.delta;
              setPersonaOutputs((prev) => ({
                ...prev,
                [pid]: (prev[pid] ?? "") + event.delta,
              }));
            }
            if (event.done === true) {
              setPersonaStatus((prev) => ({ ...prev, [pid]: "done" }));
            }
            if (event.error != null) {
              setErr((e) => ({
                ...e,
                [pid]: String(event.error),
              }));
            }
          }

          if (event.synthesis != null && typeof event.synthesis === "string") {
            setSynthesis(event.synthesis);
          }
          if (event.finished === true) {
            setIsAnalyzing(false);
            setPersonaStatus(donePersonaStatus());
          }
        }

        if (done) break;
      }

      if (status === "authenticated") {
        const meta = readPendingMeta();
        const avg = averageScoreFromOutputs(localOutputs);
        const saved = await saveAnalysisAction({
          title: meta.title,
          source: meta.source,
          inputPreview: text.slice(0, 2000),
          personaOutputs: localOutputs,
          synthesis: null,
          slideOutline,
          avgScore: avg,
        });
        if (!saved.ok) {
          setBanner(saved.message);
        }
      }

      if (status !== "authenticated") {
        try {
          localStorage.setItem(GUEST_ANALYSIS_KEY, "1");
          setGuestRev((n) => n + 1);
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
      setPersonaStatus((prev) => {
        const next = { ...prev };
        for (const id of PERSONA_IDS) {
          if (next[id] === "streaming") next[id] = "done";
        }
        return next;
      });
    }
  }, [guestBlocked, indiaMode, readPitchText, status, tab]);

  return (
    <div className="w-full max-w-6xl mx-auto px-0">
      {status === "authenticated" ? (
        <div className="mb-8 rounded-[1.75rem] border border-cream-400/70 bg-gradient-to-br from-cream-100 via-cream-100/90 to-persona-conviction/[0.08] px-5 sm:px-8 py-6 shadow-[0_12px_40px_-18px_rgba(28,25,23,0.12)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mb-1.5">
                Your workspace
              </p>
              <p className="font-serif text-2xl text-ink tracking-tight">
                Hi, {workspaceGreeting}
              </p>
              {recentDeck ? (
                <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                  <span className="text-ink-600 font-medium">
                    Last saved deck
                  </span>
                  {" — "}
                  {recentDeck.file_name}
                  <span className="text-ink-400">
                    {" "}
                    ·{" "}
                    {new Date(recentDeck.at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-ink-500 mt-2 leading-relaxed max-w-md">
                  Upload a PDF (we&apos;ll store it when you&apos;re signed in) or
                  paste text — then run all three investors at once.
                </p>
              )}
            </div>
            {recentDeck?.download_url ? (
              <a
                href={recentDeck.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-center rounded-2xl border border-cream-400 bg-cream-50/80 px-5 py-2.5 text-sm font-medium text-ink hover:bg-cream-100 hover:border-ink/15 transition-colors"
              >
                Download last PDF
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          type="button"
          onClick={() => setTab("pdf")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            tab === "pdf"
              ? "bg-ink text-cream-100"
              : "bg-cream-100 border border-cream-400 text-ink-400 hover:border-ink/20"
          }`}
        >
          PDF upload
        </button>
        <button
          type="button"
          onClick={() => setTab("paste")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            tab === "paste"
              ? "bg-ink text-cream-100"
              : "bg-cream-100 border border-cream-400 text-ink-400 hover:border-ink/20"
          }`}
        >
          Paste text
        </button>
      </div>

      {tab === "pdf" ? (
        <PdfUpload onPitchReady={bumpInput} />
      ) : (
        <TextInput onPitchReady={bumpInput} />
      )}

      <label className="flex items-center justify-center gap-3 mt-8 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={indiaMode}
          onChange={(e) => {
            const on = e.target.checked;
            setIndiaMode(on);
            try {
              sessionStorage.setItem(STORAGE_INDIA_MODE, on ? "1" : "0");
            } catch {
              /* ignore */
            }
          }}
          className="rounded border-cream-400 text-ink focus:ring-ink/20"
        />
        <span className="text-sm text-ink-600">
          India context mode — INR, UPI, India TAM & tier-2/3 benchmarks when
          relevant
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 mb-6 flex-wrap">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={isAnalyzing || !canRun() || guestBlocked}
          className="btn-primary !rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
        >
          {isAnalyzing ? "Running three investors…" : "Run adversarial analysis"}
        </button>
        {status === "authenticated" ? (
          <Link
            href="/dashboard"
            className="text-sm text-ink-400 hover:text-ink font-medium"
          >
            Analysis history →
          </Link>
        ) : null}
        {guestBlocked ? (
          <Link href="/auth" className="text-sm text-persona-scale font-medium">
            Sign in for unlimited runs →
          </Link>
        ) : null}
      </div>

      {slideHint !== null && slideHint >= 2 ? (
        <p className="text-center text-xs text-ink-400 mb-4 max-w-xl mx-auto leading-relaxed">
          Detected {slideHint} deck segments — investors add an optional{" "}
          <strong className="text-ink-500 font-medium">Per slide</strong> section
          when structure is clear.
        </p>
      ) : null}

      {banner ? (
        <p className="text-center text-sm text-persona-scale mb-6 max-w-lg mx-auto">
          {banner}
        </p>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {PERSONA_IDS.map((id) => (
          <PersonaStreamColumn
            key={id}
            id={id}
            text={personaOutputs[id]}
            status={personaStatus[id]}
            error={err[id]}
            score={scores[id]}
          />
        ))}
      </div>

      {synthesisError ? (
        <p className="text-center text-sm text-persona-scale mt-8 max-w-lg mx-auto">
          {synthesisError}
        </p>
      ) : null}

      {synthesis ? <ConflictMap synthesis={synthesis} /> : null}
    </div>
  );
}
