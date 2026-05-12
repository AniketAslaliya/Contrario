import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getAnalysisForUser,
  getAnalysisIfAccessible,
} from "@/lib/analysis-store";
import { buildAnalysisPdfBuffer } from "@/lib/report-pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row =
    (await getAnalysisForUser(params.id, session.user.id)) ||
    (await getAnalysisIfAccessible(params.id, session.user.id));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buf = await buildAnalysisPdfBuffer(row);
    const safeTitle = row.title.replace(/[^\w\s-]/g, "").slice(0, 60) || "report";
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrario-${safeTitle}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF failed" },
      { status: 500 }
    );
  }
}
