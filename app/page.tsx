"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { PersonaDemo } from "@/components/landing/PersonaDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ConflictMapPreview } from "@/components/landing/ConflictMapPreview";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Footer } from "@/components/ui/Footer";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** If Google OAuth is misconfigured to return to / instead of /api/auth/callback/google, forward the query. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (code && state) {
      window.location.replace(
        `/api/auth/callback/google?${params.toString()}`
      );
    }
  }, []);

  const aboutRef = useReveal();
  const statsRef = useReveal();
  const ctaRef = useReveal();

  return (
    <main className="relative overflow-hidden">
      <Navbar />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16">
        {/* Social proof badge */}
        <div
          className={`transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              {["★", "★", "★", "★", "★"].map((s, i) => (
                <span key={i} className="text-persona-conviction text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-8">
            Multi-lens pitch reads for founders
          </p>
        </div>

        {/* Main Heading */}
        <h1
          className={`text-center text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[1.05] tracking-tight max-w-5xl mx-auto mb-8 transition-all duration-900 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Three investors.
          <br />
          One deck.{" "}
          <span className="italic text-muted-word">Zero&nbsp;consensus.</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-center text-base sm:text-lg text-ink-400 max-w-2xl mx-auto leading-relaxed mb-12 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Upload your deck and get feedback from three investor archetypes at the same time — then see where they disagree.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row gap-4 items-center mb-20 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link href="/analyze" id="cta-try-free" className="btn-primary">
            Try Free — No Signup
          </Link>
          <Link href="#how-it-works" className="btn-secondary">
            How it works
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Link>
        </div>

        <p
          className={`text-center text-sm text-ink-400 -mt-12 mb-16 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            href="/auth"
            id="cta-sign-up"
            className="text-ink font-medium underline-offset-4 hover:underline hover:text-persona-scale transition-colors"
          >
            Sign up
          </Link>{" "}
          — cloud saves & deck history ·{" "}
          <Link
            href="/waitlist"
            className="text-ink-400 hover:text-ink underline-offset-4 hover:underline"
          >
            Waitlist
          </Link>
        </p>

        {/* Hero visual — warm gradient card with persona preview */}
        <div
          className={`w-full max-w-5xl mx-auto transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="relative rounded-3xl overflow-hidden warm-gradient grainy">
            <div className="relative z-10 p-6 sm:p-10">
              <PersonaDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BRAND / TRUST BAR
          ============================================ */}
      <section className="py-12 border-y border-cream-400/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <p className="text-sm text-ink-400 whitespace-nowrap">
            Built for founders raising from:
          </p>
          <div className="flex items-center gap-8 md:gap-14 overflow-hidden opacity-40">
            {[
              "Y Combinator",
              "Peak XV",
              "Sequoia",
              "Accel",
              "Blume",
              "100X.VC",
            ].map((name) => (
              <span
                key={name}
                className="font-serif text-lg md:text-xl whitespace-nowrap text-ink-700"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          ABOUT / WHO WE ARE
          ============================================ */}
      <section className="py-24 md:py-34 px-6 lg:px-10">
        <div
          ref={aboutRef}
          className="reveal max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-start"
        >
          <div>
            <div className="pill mb-8">What is Contrario</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1]">
              Not another{" "}
              <span className="italic text-muted-word">AI feedback</span> tool.
            </h2>
          </div>
          <div className="md:pt-4">
            <p className="text-ink-400 text-base sm:text-lg leading-relaxed mb-6">
              Every AI pitch tool gives you one voice. One AI. One generic
              checklist. Real investors don&apos;t agree — a growth VC, an
              Indian angel, and a skeptical operator will tear your deck apart in
              completely different ways.
            </p>
            <p className="text-ink-400 text-base sm:text-lg leading-relaxed">
              That{" "}
              <span className="text-ink font-medium">
                conflict is the signal
              </span>{" "}
              you actually need. Contrario fires three investor archetypes
              simultaneously and shows you exactly where they clash.
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div ref={statsRef} className="reveal max-w-5xl mx-auto mt-20">
          <div className="relative rounded-3xl overflow-hidden cool-gradient grainy">
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-0.5 p-1">
              {[
                {
                  value: "3",
                  label: "Investor archetypes analyzing simultaneously",
                },
                { value: "30s", label: "From deck upload to conflict map" },
                { value: "∞", label: "Perspectives you'd never get alone" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="backdrop-blur-sm bg-white/10 rounded-[1.4rem] p-8 sm:p-10 text-center"
                >
                  <p className="font-serif text-5xl sm:text-6xl text-white mb-3">
                    {stat.value}
                  </p>
                  <p className="text-white/85 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <HowItWorks />

      <ConflictMapPreview />

      {/* ============================================
          PERSONAS — "WHY CHOOSE US" STYLE
          ============================================ */}
      <section id="personas" className="py-24 md:py-34 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="pill mx-auto mb-8">The Personas</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
              We&apos;re not your{" "}
              <span className="italic text-muted-word">typical</span> AI
              feedback.
            </h2>
            <p className="text-ink-400 text-base sm:text-lg max-w-xl mx-auto mt-6 leading-relaxed">
              Three distinct investor archetypes with competing priorities — the
              disagreement is the feature.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Scale Chaser */}
            <div className="card-large card-gradient-scale relative grainy">
              <div className="relative z-10 p-8 sm:p-10 min-h-[380px] flex flex-col justify-end">
                <div className="mb-auto">
                  <div className="flex gap-2 flex-wrap mb-6">
                    {["Market size", "10x trajectory", "Moat"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="font-serif text-4xl sm:text-5xl text-white mb-3">
                  The Scale
                  <br />
                  Chaser
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Growth VC archetype (Peak XV style). Only cares about billion
                  dollar outcomes and market dominance.
                </p>
              </div>
            </div>

            {/* Conviction Buyer */}
            <div className="card-large card-gradient-conviction relative grainy">
              <div className="relative z-10 p-8 sm:p-10 min-h-[380px] flex flex-col justify-end">
                <div className="mb-auto">
                  <div className="flex gap-2 flex-wrap mb-6">
                    {["Founder grit", "India insight", "Capital efficiency"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <h3 className="font-serif text-4xl sm:text-5xl text-white mb-3">
                  The Conviction
                  <br />
                  Buyer
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  First-check Indian angel. Bets on people, not spreadsheets.
                  Tests your conviction and market understanding.
                </p>
              </div>
            </div>

            {/* Reality Check */}
            <div className="card-large card-gradient-reality relative grainy">
              <div className="relative z-10 p-8 sm:p-10 min-h-[380px] flex flex-col justify-end">
                <div className="mb-auto">
                  <div className="flex gap-2 flex-wrap mb-6">
                    {["Unit economics", "GTM reality", "Traction"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <h3 className="font-serif text-4xl sm:text-5xl text-white mb-3">
                  The Reality
                  <br />
                  Check
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Skeptical operator who&apos;s built and failed. Won&apos;t let
                  you hide behind optimism. Demands proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES
          ============================================ */}
      <FeatureGrid />

      {/* ============================================
          BOTTOM CTA
          ============================================ */}
      <section className="py-24 md:py-34 px-6 lg:px-10">
        <div ref={ctaRef} className="reveal max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            Stop getting{" "}
            <span className="italic line-through text-muted-word">
              one opinion
            </span>
            .
            <br />
            Start getting{" "}
            <span className="italic text-persona-scale">real conflict</span>.
          </h2>
          <p className="text-ink-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Disagreement is useful signal. Let three archetypes stress-test the same deck in parallel.
          </p>
          <Link
            href="/analyze"
            id="cta-bottom-try"
            className="btn-primary !px-12 !py-5 !text-base"
          >
            Analyze Your Deck Free →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
