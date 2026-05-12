import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import type { UserRole } from "@/lib/user-role";
import { BatchUploadClient } from "@/app/dashboard/batch/BatchUploadClient";

const ROLES: UserRole[] = ["accelerator", "mentor"];

export default async function BatchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const profile = await getProfileByUserId(session.user.id).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!role || !ROLES.includes(role)) redirect("/dashboard");

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <Link
          href="/dashboard/org"
          className="text-xs text-ink-400 hover:text-ink mb-6 inline-block"
        >
          ← Org
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-2">Batch deck upload</h1>
        <p className="text-sm text-ink-500 mb-8">
          Queue up to twenty PDFs — text is extracted sequentially (M15).
        </p>
        <BatchUploadClient />
      </div>
    </main>
  );
}
