import Link from "next/link";
import { notFound } from "next/navigation";
import { getSharedAnalysisBySlug } from "@/lib/shared-report-store";
import { AnalysisReplay } from "@/components/dashboard/AnalysisReplay";

export default async function PublicReportPage({
  params,
}: {
  params: { slug: string };
}) {
  const analysis = await getSharedAnalysisBySlug(params.slug);
  if (!analysis) notFound();

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <p className="text-xs text-ink-400 mb-6 text-center max-w-md">
        Shared Contrario report · anyone with this link can read it (until it
        expires, if an expiry was set).
      </p>
      <AnalysisReplay analysis={analysis} publicView />
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
