"use client";

import { useState } from "react";
import { addMentorNoteAction } from "@/app/dashboard/mentor-note-action";

export function MentorNoteForm({ analysisId }: { analysisId: string }) {
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await addMentorNoteAction({ analysisId, body });
    setBusy(false);
    if (r.ok) {
      setBody("");
      setMsg("Saved.");
      window.location.reload();
    } else {
      setMsg(r.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-xs text-ink-400">Add a note for the founder</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm text-ink"
        placeholder="Feedback on the deck or the AI output…"
      />
      <button
        type="submit"
        disabled={busy || body.trim().length < 3}
        className="btn-secondary !py-2 !text-sm disabled:opacity-50"
      >
        {busy ? "Saving…" : "Post note"}
      </button>
      {msg ? <p className="text-xs text-ink-500">{msg}</p> : null}
    </form>
  );
}
