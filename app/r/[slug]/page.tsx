import Link from "next/link";
import { notFound } from "next/navigation";
import { getSharedAnalysisBySlug } from "@/lib/shared-report-store";
import { AnalysisReplay } from "@/components/dashboard/AnalysisReplay";

export default async function PublicReportPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { triage?: string };
}) {
  const analysis = await getSharedAnalysisBySlug(params.slug);
  if (!analysis) notFound();

  const triage =
    searchParams.triage === "1" ||
    searchParams.triage === "true";

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <p className="text-xs text-ink-400 mb-6 text-center max-w-md">
        Shared Contrario report · anyone with this link can read it (until it
        expires, if an expiry was set).
      </p>
      <AnalysisReplay
        analysis={analysis}
        publicView
        triageMode={triage}
      />
      {!triage ? (
        <div className="mt-6 text-center text-sm">
          <Link
            href={`?triage=1`}
            className="text-ink-400 hover:text-ink underline"
          >
            Quick triage view
          </Link>
        </div>
      ) : null}
      <div className="mt-12 text-center space-y-3">
        <Link href="/" className="text-sm text-ink-400 hover:text-ink block">
          Contrario home
        </Link>
        <Link href="/auth" className="btn-primary inline-block text-sm">
          Sign in to run your own
        </Link>
      </div>
    </main>
  );
}
