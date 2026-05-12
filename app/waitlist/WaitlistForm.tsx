"use client";

import { useState } from "react";
import { submitWaitlistAction } from "@/app/waitlist/waitlist-actions";

export function WaitlistForm({ defaultRef }: { defaultRef: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await submitWaitlistAction(fd);
    setBusy(false);
    if (r.ok) {
      setCode(r.referralCode);
      setMsg(
        `You're on the list. Referral count for your code: ${r.referralCount} (invite friends with the link below).`
      );
    } else {
      setMsg(r.message);
    }
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-cream-400 bg-cream-100/70 p-6 space-y-4"
      >
        <input type="hidden" name="referred_by" defaultValue={defaultRef} />
        <label className="block text-sm">
          <span className="text-ink-400 text-xs">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm"
            placeholder="you@company.com"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-400 text-xs">Name (optional)</span>
          <input
            name="name"
            className="mt-1 w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm"
            placeholder="Alex"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Request access"}
        </button>
      </form>
      {msg ? (
        <p className="mt-4 text-sm text-ink-600 text-center whitespace-pre-wrap">
          {msg}
        </p>
      ) : null}
      {code ? (
        <div className="mt-4 rounded-xl bg-cream-200/80 px-3 py-2 text-center">
          <p className="text-xs text-ink-400 mb-1">Your referral link</p>
          <p className="text-xs font-mono break-all">
            {origin}/waitlist?ref={code}
          </p>
        </div>
      ) : null}
    </div>
  );
}
