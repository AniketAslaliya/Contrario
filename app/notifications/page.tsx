import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications-store";
import { NotificationList } from "@/app/notifications/NotificationList";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const items = await listNotifications(session.user.id);

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 md:py-20">
      <div className="w-full max-w-lg">
        <Link href="/dashboard" className="text-xs text-ink-400 hover:text-ink mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-8">Notifications</h1>
        <NotificationList initial={items} />
      </div>
    </main>
  );
}
