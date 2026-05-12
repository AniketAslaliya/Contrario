"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client — PKCE + parse tokens from redirect URL (query + hash). */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anon?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
  }
  return createBrowserClient(url, anon, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
    },
  });
}
