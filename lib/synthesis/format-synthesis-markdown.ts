import type { SynthesisPayload } from "@/lib/synthesis/post-analysis";

/** Renders synthesis as markdown for the conflict / consensus panel. */
export function synthesisPayloadToMarkdown(p: SynthesisPayload): string {
  const chunks: string[] = [];

  const cm = p.conflictMap;
  const hasZones =
    cm.green.length > 0 || cm.red.length > 0 || cm.yellow.length > 0;

  if (hasZones) {
    chunks.push("### Where investors align & clash\n");
    if (cm.green.length > 0) {
      chunks.push(
        "#### Strengths all three agree on\n" +
          cm.green.map((x) => `- ${x}`).join("\n")
      );
    }
    if (cm.red.length > 0) {
      chunks.push(
        "#### All three flag — critical risks\n" +
          cm.red.map((x) => `- ${x}`).join("\n")
      );
    }
    if (cm.yellow.length > 0) {
      chunks.push(
        "#### Split / mixed signals\n" +
          cm.yellow.map((x) => `- ${x}`).join("\n")
      );
    }
  }

  return chunks.join("\n\n").trim() || "_No synthesis output._";
}
