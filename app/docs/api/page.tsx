import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <main className="relative min-h-screen px-6 py-16 md:py-24 max-w-3xl mx-auto">
      <h1 className="font-serif text-4xl text-ink mb-2">API</h1>
      <p className="text-ink-500 text-sm mb-10">
        Accelerator integrations (M25) — stream-only analyze endpoint.
      </p>

      <section className="space-y-4 text-sm text-ink-700 leading-relaxed">
        <h2 className="text-base font-medium text-ink">Authentication</h2>
        <p>
          Set <code className="bg-cream-200/80 px-1 rounded text-xs">CONTRARIO_API_KEY</code> in
          the server environment. Send{" "}
          <code className="bg-cream-200/80 px-1 rounded text-xs">
            Authorization: Bearer &lt;key&gt;
          </code>{" "}
          or <code className="bg-cream-200/80 px-1 rounded text-xs">x-api-key: &lt;key&gt;</code>.
        </p>

        <h2 className="text-base font-medium text-ink pt-4">
          POST /api/v1/analyze
        </h2>
        <p>
          Same JSON body as the product analyze call:{" "}
          <code className="bg-cream-200/80 px-1 rounded text-xs">text</code> (required),
          optional <code className="bg-cream-200/80 px-1 rounded text-xs">slides</code> array
          for per-slide context, optional{" "}
          <code className="bg-cream-200/80 px-1 rounded text-xs">indiaContext: true</code>.
        </p>
        <p>
          Response is <strong>text/event-stream</strong> (SSE) with the same events as the
          web UI: persona deltas, synthesis payload, then{" "}
          <code className="bg-cream-200/80 px-1 rounded text-xs">finished</code>.
        </p>

        <h2 className="text-base font-medium text-ink pt-4">Rate limits</h2>
        <p>
          Per-key throttling and webhooks are not shipped in this MVP — front with your API
          gateway or contact us for managed keys.
        </p>
      </section>

      <Link href="/" className="inline-block mt-12 text-sm text-ink-400 hover:text-ink">
        ← Home
      </Link>
    </main>
  );
}
