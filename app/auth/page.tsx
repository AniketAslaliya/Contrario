import { AuthPageClient } from "./AuthPageClient";

export default function AuthPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const googleEnabled = !!(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
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
      magicLinkEnabled={magicLinkEnabled}
      callbackError={callbackError}
    />
  );
}
