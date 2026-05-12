import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-admin";

const providers: NextAuthOptions["providers"] = [];

/** Trim prevents copy/paste whitespace breaking Google’s OAuth client lookup (401 invalid_client). */
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

/** Google “Continue” uses NextAuth’s Google OAuth (env vars below), not Supabase’s Google Auth UI toggle. */
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

/** Bridge Supabase Auth (magic link) → NextAuth JWT used across the app. */
providers.push(
  CredentialsProvider({
    id: "supabase-bridge",
    name: "Email link",
    credentials: {
      access_token: { label: "Access token", type: "password" },
    },
    async authorize(credentials) {
      const token = credentials?.access_token?.trim();
      if (!token || !isSupabaseConfigured()) return null;

      try {
        const supabase = getSupabaseAdmin();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (error || !user?.id) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name:
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : null) ??
            user.email?.split("@")[0] ??
            "User",
        };
      } catch {
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          typeof token.id === "string" ? token.id : session.user.id;
        session.user.provider =
          typeof token.provider === "string" ? token.provider : undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/onboarding";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
