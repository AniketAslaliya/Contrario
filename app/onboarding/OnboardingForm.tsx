"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export function OnboardingForm({
  supabaseConfigured,
  emailHint,
}: {
  supabaseConfigured: boolean;
  emailHint?: string | null;
}) {
  return (
    <OnboardingWizard
      supabaseConfigured={supabaseConfigured}
      emailHint={emailHint}
    />
  );
}
