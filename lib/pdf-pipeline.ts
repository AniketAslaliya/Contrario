import {
  extractTextFromPdfBuffer,
} from "@/lib/pdf-parser";
import { MAX_PDF_BYTES } from "@/lib/pdf-constants";
import { storeAuthenticatedPdf } from "@/lib/deck-storage";

/** Allow lowering cap on hosts with smaller request limits (e.g. Vercel ~4.5MB). */
export function effectivePdfMaxBytes(): number {
  const raw = process.env.PDF_UPLOAD_MAX_BYTES?.trim();
  if (!raw) return MAX_PDF_BYTES;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1024) return MAX_PDF_BYTES;
  return Math.min(MAX_PDF_BYTES, Math.floor(n));
}

export type ParsePdfSuccess = {
  ok: true;
  text: string;
  numPages: number;
  byteLength: number;
  storedObjectPath?: string;
};

export type ParsePdfFailure = {
  ok: false;
  code:
    | "no_file"
    | "too_large"
    | "invalid_type"
    | "empty_text"
    | "parse_error";
  message: string;
};

export type ParsePdfResult = ParsePdfSuccess | ParsePdfFailure;

function isLikelyPdf(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

/**
 * Server-only: validate, optionally persist to Storage, extract text.
 */
export async function runPdfPipeline(
  file: File | null,
  userId: string | null
): Promise<ParsePdfResult> {
  if (!file || file.size === 0) {
    return { ok: false, code: "no_file", message: "Choose a PDF file." };
  }

  const cap = effectivePdfMaxBytes();
  if (file.size > cap) {
    return {
      ok: false,
      code: "too_large",
      message: `File must be ${(cap / (1024 * 1024)).toFixed(cap >= 1024 * 1024 ? 0 : 1)}MB or smaller.`,
    };
  }

  if (!isLikelyPdf(file)) {
    return {
      ok: false,
      code: "invalid_type",
      message: "Only PDF files are supported.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let storedObjectPath: string | undefined;
  if (userId) {
    storedObjectPath = await storeAuthenticatedPdf(
      userId,
      file.name,
      buffer
    );
  }

  try {
    const { text, numPages } = await extractTextFromPdfBuffer(buffer);
    if (!text.trim()) {
      return {
        ok: false,
        code: "empty_text",
        message: "No readable text in this PDF. Try another file or paste text instead.",
      };
    }
    return {
      ok: true,
      text,
      numPages,
      byteLength: buffer.length,
      storedObjectPath,
    };
  } catch {
    return {
      ok: false,
      code: "parse_error",
      message: "Could not read this PDF. It may be corrupt or password-protected.",
    };
  }
}
