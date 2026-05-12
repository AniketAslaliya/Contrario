"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Parallel Streaming",
    description:
      "All 3 investor personas respond simultaneously. See tokens arrive in real-time across three cards.",
    icon: "⚡",
    gradient: "from-brand-600/20 to-accent-glow/10",
  },
  {
    title: "Conflict Map",
    description:
      "The signature feature. See exactly where investors agree and where they clash — that's your real signal.",
    icon: "🗺️",
    gradient: "from-persona-scale/10 via-persona-conviction/10 to-persona-reality/10",
  },
  {
    title: "PDF or Text",
    description:
      "Upload your pitch deck as PDF or paste your raw startup idea. Both paths feed the same analysis engine.",
    icon: "📄",
    gradient: "from-brand-800/20 to-brand-600/10",
  },
  {
    title: "India Context Mode",
    description:
      "Toggle India-specific benchmarks: CAC in INR, India TAM, UPI distribution, Tier 2/3 dynamics.",
    icon: "🇮🇳",
    gradient: "from-persona-conviction/15 to-persona-conviction/5",
  },
  {
    title: "Session History",
    description:
      "Track how your deck improves across versions. Compare v1 vs v2 scores across all three personas.",
    icon: "📊",
    gradient: "from-accent-cyan/10 to-brand-600/10",
  },
  {
    title: "Shareable Reports",
    description:
      "Generate a unique link for any analysis. Share with mentors and co-founders — no login required to view.",
    icon: "🔗",
    gradient: "from-persona-reality/10 to-brand-700/10",
  },
];

export function FeatureGrid() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setVisibleItems((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.2 }
    );

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-brand-400 uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 text-white">
            Everything you need to{" "}
            <span className="text-gradient">stress-test</span> your pitch
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className={`group glass rounded-xl p-6 border-glow border-glow-hover cursor-default transition-all duration-700 hover:scale-[1.02] ${
                visibleItems.has(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
