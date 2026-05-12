import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import {
  getOrgById,
  isOrgAdmin,
} from "@/lib/org-store";
import type { UserRole } from "@/lib/user-role";
import { OrgWorkspace } from "@/app/dashboard/org/OrgWorkspace";

const ROLES: UserRole[] = ["accelerator", "mentor"];

export default async function OrgDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const profile = await getProfileByUserId(session.user.id).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!role || !ROLES.includes(role)) redirect("/dashboard");

  const org = profile?.org_id ? await getOrgById(profile.org_id) : null;
  const isAdmin =
    org && session.user.id
      ? await isOrgAdmin(session.user.id, org.id)
      : false;

  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg">
        <h1 className="font-serif text-3xl text-ink mb-2">Organization</h1>
        <p className="text-sm text-ink-500 mb-8">
          Create a cohort workspace, share an invite code, and tune composite scoring
          weights (M14 · M17).
        </p>
        <OrgWorkspace org={org} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
