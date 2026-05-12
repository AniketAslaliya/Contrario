import type { ParsePdfResult } from "@/lib/pdf-pipeline";

/**
 * PDF extraction must go through the Route Handler — not a Server Action —
 * so uploads up to MAX_PDF_BYTES can reach Node (Server Actions default ~1MB cap).
 */
export async function extractPdfViaApiRoute(
  formData: FormData
): Promise<ParsePdfResult> {
  let res: Response;
  try {
    res = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
  } catch {
    return {
      ok: false,
      code: "parse_error",
      message: "Network error while uploading. Check your connection and try again.",
    };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return {
      ok: false,
      code: "parse_error",
      message: "Upload failed (server did not return JSON).",
    };
  }

  const parsed = data as Partial<ParsePdfResult> | null;
  if (parsed && typeof parsed === "object" && parsed.ok === false) {
    return {
      ok: false,
      code: parsed.code ?? "parse_error",
      message: parsed.message ?? "Could not process this PDF.",
    };
  }

  if (parsed && typeof parsed === "object" && parsed.ok === true) {
    return {
      ok: true,
      text: String(parsed.text ?? ""),
      numPages: typeof parsed.numPages === "number" ? parsed.numPages : 0,
      byteLength: typeof parsed.byteLength === "number" ? parsed.byteLength : 0,
      storedObjectPath: parsed.storedObjectPath,
    };
  }

  return {
    ok: false,
    code: "parse_error",
    message: res.ok ? "Unexpected server response." : `Upload failed (${res.status}).`,
  };
}
