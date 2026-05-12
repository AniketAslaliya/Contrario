import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrario — Three Investors. One Deck. Zero Consensus.",
  description:
    "The world's first adversarial multi-persona pitch intelligence platform. Upload your pitch deck and get simultaneous feedback from three distinct investor archetypes — then see where they clash.",
  keywords: [
    "pitch deck feedback",
    "AI pitch analysis",
    "investor feedback",
    "startup pitch",
    "Contrario",
    "pitch intelligence",
  ],
  authors: [{ name: "Aniket Aslaliya" }],
  openGraph: {
    title: "Contrario — Three Investors. One Deck. Zero Consensus.",
    description:
      "Upload your pitch deck and get simultaneous feedback from three distinct investor archetypes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="noise-overlay antialiased min-h-screen bg-surface-0 text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
