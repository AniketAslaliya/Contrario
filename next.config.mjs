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
