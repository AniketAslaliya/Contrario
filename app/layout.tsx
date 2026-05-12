import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ShellEntryLoader } from "@/components/ui/ShellEntryLoader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className={`${inter.className} antialiased min-h-screen bg-cream-200 text-ink`}>
        <AuthProvider>
          <ShellEntryLoader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
