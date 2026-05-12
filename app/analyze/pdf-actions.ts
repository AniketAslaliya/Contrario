"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { runPdfPipeline } from "@/lib/pdf-pipeline";
import type { ParsePdfResult } from "@/lib/pdf-pipeline";

/**
 * M04 server action — same pipeline as POST /api/parse-pdf.
 * When M06 ships, hand `text` to the analyze API or pass via sessionStorage from the client.
 */
export async function extractPitchPdfAction(
  formData: FormData
): Promise<ParsePdfResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, code: "no_file", message: "Missing PDF file." };
  }

  return runPdfPipeline(file, userId);
}
