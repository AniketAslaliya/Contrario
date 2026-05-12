"use client";

import { useState, useEffect } from "react";

const personas = [
  {
    id: "scale-chaser",
    name: "The Scale Chaser",
    archetype: "Growth VC",
    color: "persona-scale",
    borderClass: "border-persona-scale/30",
    glowClass: "glow-scale",
    bgClass: "bg-persona-scale/5",
    dotClass: "bg-persona-scale",
    score: 7.2,
    verdict: "CONDITIONAL",
    feedback: [
      "TAM story is compelling at $4.2B but I need the SAM funnel breakdown",
      "No clear moat — what stops Evalyze from adding a second persona?",
      "India-first positioning is fine, but show me the path to global",
      "Team is technical but where's the GTM hire?",
      "Unit economics hint at 80% margins — validate this with real cohort data",
    ],
    concern: "Defensibility is weak. A feature, not a company — unless you prove the network effect.",
  },
  {
    id: "conviction-buyer",
    name: "The Conviction Buyer",
    archetype: "Angel Investor",
    color: "persona-conviction",
    borderClass: "border-persona-conviction/30",
    glowClass: "glow-conviction",
    bgClass: "bg-persona-conviction/5",
    dotClass: "bg-persona-conviction",
    score: 8.5,
    verdict: "INVEST",
    feedback: [
      "This founder GETS the Indian ecosystem pain — the Activate angle is smart",
      "Capital efficient build — Claude API costs are predictable and manageable",
      "Conflict map is genuinely new UX — no one else shows investor disagreement",
      "Multi-persona approach has viral potential in founder WhatsApp groups",
      "The 5 user types show you've thought beyond founders — that's maturity",
    ],
    concern: "Can you close your first 50 paying founders before running out of personal capital?",
  },
  {
    id: "reality-check",
    name: "The Reality Check",
    archetype: "Skeptical Operator",
    color: "persona-reality",
    borderClass: "border-persona-reality/30",
    glowClass: "glow-reality",
    bgClass: "bg-persona-reality/5",
    dotClass: "bg-persona-reality",
    score: 5.8,
    verdict: "PASS",
    feedback: [
      "Show me the CAC. You claim virality but what's your actual acquisition cost?",
      "API costs at scale: 3 Claude calls per analysis × 1000 users/day = $X/month?",
      "Accelerator sales cycle is 6-12 months — that's your biggest GTM risk",
      "The free tier is generous. What's the conversion funnel to paid?",
      "No traction data. Not even a waitlist number. That's a red flag.",
    ],
    concern: "You're building features before validating demand. Talk to 50 founders first.",
  },
];

export function PersonaDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typingProgress, setTypingProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // Cycle through cards on mobile for auto-showcase
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate typing effect for each persona
    const timers: NodeJS.Timeout[] = [];
    personas.forEach((persona, idx) => {
      const totalChars = persona.feedback.join("").length;
      let progress = 0;
      const timer = setInterval(() => {
        progress += 3;
        if (progress > totalChars) progress = totalChars;
        setTypingProgress((prev) => ({
          ...prev,
          [persona.id]: progress,
        }));
        if (progress >= totalChars) clearInterval(timer);
      }, 20 + idx * 10);
      timers.push(timer);
    });
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Desktop: 3 columns */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <PersonaCard key={persona.id} persona={persona} progress={typingProgress[persona.id] || 0} />
        ))}
      </div>

      {/* Mobile: carousel */}
      <div className="md:hidden">
        <PersonaCard persona={personas[activeIndex]} progress={typingProgress[personas[activeIndex].id] || 0} />
        <div className="flex justify-center gap-2 mt-4">
          {personas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === activeIndex ? `${p.dotClass} scale-125` : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Conflict bar preview */}
      <div className="mt-6 glass rounded-xl p-4 border-glow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-persona-scale via-persona-conviction to-persona-reality flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">⚡</span>
          </div>
          <span className="text-sm font-semibold text-zinc-300">
            Conflict Map
          </span>
          <span className="text-xs text-zinc-600 ml-auto">Sample output</span>
        </div>
        <div className="space-y-2">
          <ConflictRow
            level="all-agree"
            text="Defensibility / moat needs strengthening"
            tag="ALL 3 FLAG"
          />
          <ConflictRow
            level="two-agree"
            text="GTM strategy unclear for enterprise"
            tag="2 OF 3"
          />
          <ConflictRow
            level="disagree"
            text="Capital efficiency vs. growth — investors split"
            tag="THEY DISAGREE"
          />
        </div>
      </div>
    </div>
  );
}

function PersonaCard({
  persona,
  progress,
}: {
  persona: (typeof personas)[0];
  progress: number;
}) {
  const totalChars = persona.feedback.join("").length;
  const isComplete = progress >= totalChars;

  // Calculate which feedback items to show based on progress
  let charsUsed = 0;
  const visibleFeedback = persona.feedback.map((fb) => {
    const start = charsUsed;
    charsUsed += fb.length;
    if (progress >= charsUsed) return fb;
    if (progress > start) return fb.slice(0, progress - start);
    return "";
  });

  return (
    <div
      className={`glass rounded-xl p-5 ${persona.borderClass} border ${persona.glowClass} transition-all duration-500 hover:scale-[1.02]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${persona.dotClass}`} />
            <h3 className="text-sm font-bold text-white">{persona.name}</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 ml-[18px]">
            {persona.archetype}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{persona.score}</div>
          <div className={`text-[10px] font-semibold tracking-wider ${
            persona.verdict === "INVEST"
              ? "text-green-400"
              : persona.verdict === "PASS"
              ? "text-red-400"
              : "text-yellow-400"
          }`}>
            {persona.verdict}
          </div>
        </div>
      </div>

      {/* Feedback items */}
      <div className="space-y-2 mb-4">
        {visibleFeedback.map(
          (fb, i) =>
            fb && (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-zinc-600 mt-0.5 shrink-0">→</span>
                <span className="text-zinc-400 leading-relaxed">
                  {fb}
                  {!isComplete && i === visibleFeedback.filter(Boolean).length - 1 && (
                    <span className="inline-block w-1.5 h-3.5 bg-white/70 ml-0.5 animate-typing" />
                  )}
                </span>
              </div>
            )
        )}
      </div>

      {/* Key concern */}
      {isComplete && (
        <div className={`${persona.bgClass} rounded-lg p-3 border ${persona.borderClass} animate-fade-in`}>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Key Concern
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {persona.concern}
          </p>
        </div>
      )}
    </div>
  );
}

function ConflictRow({
  level,
  text,
  tag,
}: {
  level: "all-agree" | "two-agree" | "disagree";
  text: string;
  tag: string;
}) {
  const styles = {
    "all-agree": {
      bar: "bg-red-500/80",
      tag: "bg-red-500/20 text-red-400 border-red-500/30",
      text: "text-zinc-200",
    },
    "two-agree": {
      bar: "bg-yellow-500/60",
      tag: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      text: "text-zinc-300",
    },
    disagree: {
      bar: "bg-zinc-600/40",
      tag: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
      text: "text-zinc-400",
    },
  };

  const s = styles[level];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-1 h-6 rounded-full ${s.bar}`} />
      <span className={`text-xs ${s.text} flex-1`}>{text}</span>
      <span
        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.tag}`}
      >
        {tag}
      </span>
    </div>
  );
}
