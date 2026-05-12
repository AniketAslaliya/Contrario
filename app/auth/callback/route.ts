import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase redirects here after the user clicks the email magic link (PKCE `code` exchange).
 * Add this URL under Authentication → URL Configuration → Redirect URLs in Supabase.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const redirectHomeError = NextResponse.redirect(`${url.origin}/auth?error=callback`);

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    return redirectHomeError;
  }

  if (!code) {
    return redirectHomeError;
  }

  const redirectOk = NextResponse.redirect(`${url.origin}/auth/sync-nextauth`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectOk.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback]", error.message);
    return redirectHomeError;
  }

  return redirectOk;
}
