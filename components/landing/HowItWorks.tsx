"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Upload Your Deck",
    description: "Drop your pitch deck PDF or paste your raw idea. We extract the signal from the noise.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Three Personas Fire",
    description: "Scale Chaser, Conviction Buyer, and Reality Check analyze your pitch simultaneously — in parallel.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "See the Conflict",
    description: "The conflict map reveals where investors agree (fix immediately) and where they clash (your strategic choice).",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setVisibleSteps((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.3 }
    );

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-brand-400 uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 text-white">
            From deck to conflict map in{" "}
            <span className="text-gradient">30 seconds</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className={`relative glass rounded-2xl p-8 border-glow transition-all duration-700 ${
                visibleSteps.has(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Step number */}
              <div className="text-6xl font-black text-white/[0.03] absolute top-4 right-6 select-none">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-brand-900/30 border border-brand-700/20 flex items-center justify-center text-brand-400 mb-6">
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>

              {/* Connector line (between cards on desktop) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-gradient-to-r from-brand-700/40 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
