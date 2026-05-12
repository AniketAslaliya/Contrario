"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications-store";

export async function markNotificationReadAction(
  notificationId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  try {
    await markNotificationRead(userId, notificationId);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed",
    };
  }
}
