import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

export async function insertNotification(
  userId: string,
  message: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await getSupabaseAdmin().from("notifications").insert({
    user_id: userId,
    message: message.slice(0, 500),
    read: false,
  });
}

export async function listNotifications(userId: string): Promise<
  { id: string; message: string; read: boolean; created_at: string }[]
> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("notifications")
    .select("id, message, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []) as {
    id: string;
    message: string;
    read: boolean;
    created_at: string;
  }[];
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await getSupabaseAdmin()
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
}
