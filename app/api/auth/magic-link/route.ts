import { createClient } from "@supabase/supabase-js";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Sends a Supabase Auth magic link (configure Email provider + redirect URLs in Supabase Dashboard).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

  if (!email || !isValidEmail(email)) {
    return Response.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return Response.json(
      { ok: false, message: "Email sign-in is not configured (missing Supabase URL or anon key)." },
      { status: 503 }
    );
  }

  const origin = new URL(req.url).origin;
  const redirectTo = `${origin}/auth/callback`;

  const supabase = createClient(url, anon);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[magic-link]", error.message);
    return Response.json(
      { ok: false, message: "Could not send the link. Try again in a moment." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
