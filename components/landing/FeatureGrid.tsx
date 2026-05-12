"use client";

import { useEffect, useRef } from "react";

const features = [
  {
    icon: "⚡",
    title: "Parallel Streaming",
    description:
      "All three personas run at the same time. Tokens show up live as each stream prints.",
  },
  {
    icon: "🗺️",
    title: "Conflict Map",
    description:
      "Visual overlay showing where investors agree (fix these) and where they diverge (positioning decisions).",
  },
  {
    icon: "📄",
    title: "PDF or Text",
    description:
      "Upload a deck PDF (we parse every slide) or paste raw pitch text. Works with decks or just ideas.",
  },
  {
    icon: "🇮🇳",
    title: "India Context Mode",
    description:
      "Benchmarks tuned for Indian market dynamics. ₹ currency, local comps, desi investor psychology.",
  },
  {
    icon: "📊",
    title: "Version Tracking",
    description:
      "Re-run with updated decks. See how your conflict map evolves. Track improvement over sessions.",
  },
  {
    icon: "🔗",
    title: "Shareable Reports",
    description:
      "Send a link, not a PDF. Mentors, co-founders, and advisors get the full picture in one click.",
  },
];

export function FeatureGrid() {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 md:py-34 px-6 lg:px-10 border-t border-cream-400/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="pill mx-auto mb-8">Features</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
            One loop: upload, three reads, one conflict map.
          </h2>
        </div>

        <div
          ref={ref}
          className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="card group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl mb-5">{f.icon}</div>
              <h3 className="font-serif text-2xl mb-3 text-ink group-hover:text-persona-scale transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-ink-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
