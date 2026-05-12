import { listMentorNotes } from "@/lib/mentor-notes-store";
import { MentorNoteForm } from "@/components/dashboard/MentorNoteForm";

type Props = { analysisId: string; allowCompose: boolean };

export async function MentorNotesSection({ analysisId, allowCompose }: Props) {
  const notes = await listMentorNotes(analysisId);
  if (!allowCompose && notes.length === 0) return null;

  return (
    <section className="rounded-2xl border border-cream-400 bg-cream-100/50 p-4 md:p-6 mb-10 max-w-3xl mx-auto w-full">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-400 mb-3">
        Mentor notes
      </p>
      <ul className="space-y-3 mb-6">
        {notes.length === 0 ? (
          <li className="text-sm text-ink-500">No mentor notes yet.</li>
        ) : (
          notes.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-cream-400/80 bg-cream-100/80 px-4 py-3 text-sm text-ink-700 whitespace-pre-wrap"
            >
              {n.body}
              <p className="text-[10px] text-ink-400 mt-2">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
      {allowCompose ? <MentorNoteForm analysisId={analysisId} /> : null}
    </section>
  );
}
