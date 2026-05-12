import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export type MentorNoteRow = {
  id: string;
  analysis_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
};

export async function listMentorNotes(
  analysisId: string
): Promise<MentorNoteRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("mentor_notes")
    .select("id, analysis_id, author_user_id, body, created_at")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MentorNoteRow[];
}

export async function insertMentorNote(params: {
  analysisId: string;
  authorUserId: string;
  body: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
  const { error } = await getSupabaseAdmin().from("mentor_notes").insert({
    analysis_id: params.analysisId,
    author_user_id: params.authorUserId,
    body: params.body.slice(0, 8000),
  });
  if (error) throw new Error(error.message);
}
