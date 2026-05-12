/**
 * M09 — Heuristic slide / page structure from extracted deck text.
 * If we cannot infer ≥2 segments with enough content, callers treat as flat pitch.
 */

export type PitchSlide = {
  index: number;
  /** Short label for display (first line or "Page N") */
  title: string;
  /** Slide/page body (truncated upstream if huge) */
  content: string;
};

const MAX_SLIDE_CHARS = 12_000;

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

/** Extract slide-like chunks; returns null when structure is not confident. */
export function detectSlidesFromPitch(fullText: string): PitchSlide[] | null {
  const t = normalize(fullText);
  if (t.length < 120) return null;

  // 1) PDF form-feed page breaks
  if (t.includes("\f")) {
    const pages = t
      .split(/\f/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40);
    if (pages.length >= 2) {
      return pages.map((content, i) => ({
        index: i + 1,
        title: `Page ${i + 1}`,
        content: sliceContent(content),
      }));
    }
  }

  // 2) "Slide N" / "Slide N:" headings (case-insensitive)
  const slideHeading = /(?=^Slide\s+\d+\s*[:\-—.]?\s*)/gim;
  const chunks = t.split(slideHeading).map((s) => s.trim()).filter(Boolean);
  if (chunks.length >= 2) {
    const out: PitchSlide[] = [];
    for (const chunk of chunks) {
      const m = chunk.match(/^Slide\s+(\d+)\s*[:\-—.]?\s*\n?([\s\S]*)/i);
      if (!m) continue;
      const idx = Number(m[1]);
      if (Number.isNaN(idx) || idx < 1) continue;
      const body = m[2]?.trim() ?? "";
      if (body.length < 30) continue;
      const firstLine = body.split("\n").find((l) => l.trim().length > 0);
      const title = (firstLine ?? `Slide ${idx}`).trim().slice(0, 100);
      out.push({ index: idx, title, content: sliceContent(body) });
    }
    out.sort((a, b) => a.index - b.index);
    if (out.length >= 2) return dedupeByIndex(out);
  }

  // 3) Numbered section breaks: "1." / "2)" at line start (common in exports)
  const numbered = splitNumberedSections(t);
  if (numbered && numbered.length >= 3) return numbered;

  return null;
}

function sliceContent(s: string): string {
  return s.length > MAX_SLIDE_CHARS ? s.slice(0, MAX_SLIDE_CHARS) + "\n…" : s;
}

function dedupeByIndex(slides: PitchSlide[]): PitchSlide[] {
  const map = new Map<number, PitchSlide>();
  for (const s of slides) {
    if (!map.has(s.index)) map.set(s.index, s);
  }
  return Array.from(map.values()).sort((a, b) => a.index - b.index);
}

function splitNumberedSections(t: string): PitchSlide[] | null {
  const lines = t.split("\n");
  const breaks: number[] = [];
  const re = /^\s*(\d{1,2})\s*[\.\)]\s+(?=\S)/;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && re.test(lines[i]!)) breaks.push(i);
  }
  if (breaks.length < 2) return null;

  const segments: string[] = [];
  let start = 0;
  for (const b of breaks) {
    if (b > start) segments.push(lines.slice(start, b).join("\n").trim());
    start = b;
  }
  segments.push(lines.slice(start).join("\n").trim());

  const use = segments.filter((s) => s.length > 80);
  if (use.length < 3) return null;

  return use.slice(0, 24).map((content, i) => {
    const line = content.split("\n")[0]?.trim() ?? `Section ${i + 1}`;
    return {
      index: i + 1,
      title: line.slice(0, 100),
      content: sliceContent(content),
    };
  });
}
