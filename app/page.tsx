"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { PersonaDemo } from "@/components/landing/PersonaDemo";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/ui/Footer";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-900/20 blur-[120px] pointer-events-none animate-glow-pulse" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-glow/15 blur-[120px] pointer-events-none animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-persona-scale/5 blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-glow text-sm text-zinc-400 mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Built for Activate AI Fellows — Summer 2026
          </div>

          {/* Main heading */}
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="text-white">Three investors.</span>
            <br />
            <span className="text-white">One deck.</span>
            <br />
            <span className="text-gradient-warm">Zero consensus.</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Upload your pitch deck and get{" "}
            <span className="text-white font-medium">simultaneous feedback</span>{" "}
            from three distinct investor archetypes — then see exactly where they{" "}
            <span className="text-gradient font-semibold">clash</span>.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Link
              href="/analyze"
              id="cta-try-free"
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-800 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(92,124,250,0.3)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Try Free — No Signup</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500 to-accent-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/auth"
              id="cta-sign-up"
              className="px-8 py-4 rounded-xl text-zinc-300 font-medium text-lg glass border-glow border-glow-hover transition-all duration-300 hover:text-white hover:scale-105 active:scale-95"
            >
              Sign Up →
            </Link>
          </div>

          {/* Persona trio preview */}
          <div
            className={`transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <PersonaDemo />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Features */}
      <FeatureGrid />

      {/* Bottom CTA */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop getting{" "}
            <span className="line-through text-zinc-600">one opinion</span>.
            <br />
            Start getting{" "}
            <span className="text-gradient-warm">real conflict</span>.
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            The best pitch decks are forged in disagreement. Let three investor
            archetypes tear yours apart — simultaneously.
          </p>
          <Link
            href="/analyze"
            id="cta-bottom-try"
            className="inline-flex px-10 py-5 bg-gradient-to-r from-brand-600 to-brand-800 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(92,124,250,0.3)] hover:scale-105"
          >
            Analyze Your Deck Free →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
