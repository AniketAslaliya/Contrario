import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { runPdfPipeline } from "@/lib/pdf-pipeline";

/** Node runtime — pdf-parse */
export const runtime = "nodejs";

/**
 * POST multipart/form-data with field `file` (single PDF).
 * maxSize 10MB — see lib/pdf-constants.ts (10 * 1024 * 1024).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json(
      { ok: false, code: "bad_request", message: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { ok: false, code: "no_file", message: "Missing file field." },
      { status: 400 }
    );
  }

  const out = await runPdfPipeline(file, userId);

  if (!out.ok) {
    const status =
      out.code === "too_large"
        ? 413
        : out.code === "invalid_type"
          ? 415
          : out.code === "no_file"
            ? 400
            : 422;
    return Response.json(out, { status });
  }

  return Response.json(out);
}
