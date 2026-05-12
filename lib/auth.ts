import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Build providers list dynamically
const providers: NextAuthOptions["providers"] = [];

// Google OAuth — always available when credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Credentials provider for development/demo magic-link simulation
// In production with Supabase adapter, swap this for EmailProvider
providers.push(
  CredentialsProvider({
    id: "email-login",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "you@example.com" },
    },
    async authorize(credentials) {
      // In dev/demo mode: any email signs in
      // In production: this will be replaced by proper EmailProvider + adapter
      if (credentials?.email) {
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email.split("@")[0],
        };
      }
      return null;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
      // After sign-in, redirect to onboarding or dashboard
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/onboarding";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
