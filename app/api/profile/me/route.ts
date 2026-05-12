import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { getSignedDeckDownloadUrl } from "@/lib/deck-storage";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Current user profile snippet + optional signed URL for last uploaded deck.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({
      display_name: null,
      last_deck: null,
    });
  }

  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return Response.json({
        display_name: null,
        last_deck: null,
      });
    }

    let downloadUrl: string | null = null;
    if (
      profile.last_deck_storage_path &&
      profile.last_deck_storage_path.startsWith(`${userId}/`)
    ) {
      downloadUrl = await getSignedDeckDownloadUrl(
        profile.last_deck_storage_path,
        300
      );
    }

    return Response.json({
      display_name: profile.display_name ?? null,
      last_deck:
        profile.last_deck_file_name && profile.last_deck_at
          ? {
              file_name: profile.last_deck_file_name,
              at: profile.last_deck_at,
              download_url: downloadUrl,
            }
          : null,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
