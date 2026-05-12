"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Upload",
    description:
      "Drop your pitch deck PDF or paste your raw pitch text. We parse every slide, every claim, every number.",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Three investor archetypes fire simultaneously via parallel AI API calls. No waiting. Streaming tokens arrive in real-time.",
  },
  {
    number: "03",
    title: "Conflict",
    description:
      "Our conflict engine maps where all three investors agree (your critical fixes) and where they diverge (your positioning choices).",
  },
  {
    number: "04",
    title: "Iterate",
    description:
      "Improve your deck, re-run. Track how your conflict map evolves over versions. Watch disagreement shrink where it matters.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-34 px-6 lg:px-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="pill mx-auto mb-8">How It Works</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
            We handle{" "}
            <span className="italic text-muted-word">everything</span> so you
            don&apos;t have&nbsp;to.
          </h2>
          <p className="text-ink-400 text-base sm:text-lg max-w-xl mx-auto mt-6 leading-relaxed">
            From deck parsing to conflict mapping — upload once, get three
            perspectives in seconds.
          </p>
        </div>

        <div ref={sectionRef} className="reveal">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-8 md:gap-16">
                {/* Left side — big serif number */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <span className="font-serif text-6xl md:text-8xl text-ink-100 select-none">
                      {step.title}
                    </span>
                    <span className="absolute -top-2 -right-5 font-sans text-xs text-ink-300">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Right side — description */}
                <div
                  className={`flex-1 pb-16 ${
                    i < steps.length - 1 ? "border-l border-cream-400 pl-8 md:pl-12" : "pl-8 md:pl-12"
                  }`}
                >
                  <p className="text-ink-400 text-base leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
