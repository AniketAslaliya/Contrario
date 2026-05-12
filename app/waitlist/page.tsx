import Link from "next/link";
import { referralLeaderboard } from "@/lib/waitlist-store";
import { WaitlistForm } from "@/app/waitlist/WaitlistForm";

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const refDefault = searchParams.ref?.trim() ?? "";
  const board = await referralLeaderboard();

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-24 md:py-28">
      <p className="pill mb-6">Early access</p>
      <h1 className="font-serif text-4xl md:text-5xl text-ink text-center mb-4">
        Join the <span className="italic text-muted-word">waitlist</span>
      </h1>
      <p className="text-ink-500 text-center max-w-lg mb-10 leading-relaxed">
        Be first in line when we open full cohort tools. Share your referral
        code after signing up — early access opens after 3 successful referrals.
      </p>
      <WaitlistForm defaultRef={refDefault} />

      <div className="mt-16 w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-3 text-center">
          Top referrers
        </p>
        {board.length === 0 ? (
          <p className="text-sm text-ink-500 text-center">No referrals yet.</p>
        ) : (
          <ol className="rounded-2xl border border-cream-400 bg-cream-100/60 divide-y divide-cream-400/80">
            {board.map((r, i) => (
              <li
                key={r.code}
                className="flex justify-between px-4 py-3 text-sm text-ink"
              >
                <span>
                  <span className="text-ink-400 mr-2 tabular-nums">{i + 1}.</span>
                  <span className="font-mono text-xs">{r.code}</span>
                </span>
                <span className="tabular-nums">{r.referrals} referrals</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link href="/" className="mt-12 text-sm text-ink-400 hover:text-ink">
        ← Home
      </Link>
    </main>
  );
}
