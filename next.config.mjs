/**
 * NextAuth.js base URL: required for OAuth callbacks and cookies.
 * - Override with NEXTAUTH_URL in .env.local (local) or Vercel env (production / custom domain).
 * - If unset: on Vercel we derive https://$VERCEL_URL (Preview + Production).
 * - If unset locally: default http://localhost:3000 (use NEXTAUTH_URL if you use another port).
 */
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    /** Safety net if anything still posts File-backed Server Actions (~1MB default). */
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
