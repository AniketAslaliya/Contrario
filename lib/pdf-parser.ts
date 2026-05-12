import pdf from "pdf-parse";

export type ExtractPdfOk = {
  text: string;
  numPages: number;
};

export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<ExtractPdfOk> {
  const data = await pdf(buffer, { max: 0 });
  const text = normalizeExtractedText(data.text ?? "");
  return { text, numPages: data.numpages ?? 0 };
}

function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
