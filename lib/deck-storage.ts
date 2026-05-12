import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

function bucketName(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_DECK_BUCKET?.trim() || "deck-uploads"
  );
}

/**
 * Stores PDF for signed-in users. Fails softly (returns undefined) if Supabase
 * Storage is missing or bucket does not exist yet — extraction still proceeds.
 */
export async function storeAuthenticatedPdf(
  userId: string,
  originalName: string,
  buffer: Buffer
): Promise<string | undefined> {
  if (!isSupabaseConfigured()) return undefined;

  const safe = originalName.replace(/[^\w.\-()+ ]/g, "_").slice(0, 120);
  const objectPath = `${userId}/${Date.now()}-${safe || "deck.pdf"}`;

  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.storage
      .from(bucketName())
      .upload(objectPath, buffer, {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: false,
      });
    if (error) {
      console.error("[deck-storage] upload:", error.message);
      return undefined;
    }
    return objectPath;
  } catch (e) {
    console.error("[deck-storage]", e);
    return undefined;
  }
}

export async function getSignedDeckDownloadUrl(
  objectPath: string,
  expiresSec = 120
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.storage
      .from(bucketName())
      .createSignedUrl(objectPath, expiresSec);
    if (error || !data?.signedUrl) {
      console.error("[deck-storage] signedUrl:", error?.message);
      return null;
    }
    return data.signedUrl;
  } catch (e) {
    console.error("[deck-storage]", e);
    return null;
  }
}
