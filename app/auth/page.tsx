import { AuthPageClient } from "./AuthPageClient";

export default function AuthPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID?.trim();
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET?.trim();
  const googleEnabled = hasGoogleId && hasGoogleSecret;
  /** NextAuth requires both; common mistake: only Client ID in dashboard (Secret missing). */
  const googleEnvWarning =
    hasGoogleId && !hasGoogleSecret
      ? "Add GOOGLE_CLIENT_SECRET from the same Google Cloud OAuth client (NextAuth uses both — the Supabase Google toggle alone is not enough for this button)."
      : !hasGoogleId && hasGoogleSecret
        ? "Add GOOGLE_CLIENT_ID to match your OAuth client."
        : undefined;
  const magicLinkEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );

  const errRaw = searchParams?.error;
  const callbackError =
    typeof errRaw === "string" ? errRaw : Array.isArray(errRaw) ? errRaw[0] : undefined;

  return (
    <AuthPageClient
      googleEnabled={googleEnabled}
      googleEnvWarning={googleEnvWarning}
      magicLinkEnabled={magicLinkEnabled}
      callbackError={callbackError}
    />
  );
}
