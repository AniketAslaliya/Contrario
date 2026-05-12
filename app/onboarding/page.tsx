// M03 onboarding roles: Founder, Student, Accelerator, Angel, Mentor (labels in RolePicker.tsx).
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { getHomePathForRole } from "@/lib/user-role";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/auth");

  const configured = isSupabaseConfigured();

  try {
    if (configured) {
      const profile = await getProfileByUserId(session.user.id);
      if (profile?.role) redirect(getHomePathForRole(profile.role));
    }
  } catch {
    // Missing table / network — client can retry after migration.
  }

  return (
    <OnboardingForm
      supabaseConfigured={configured}
      emailHint={session.user.email}
    />
  );
}
