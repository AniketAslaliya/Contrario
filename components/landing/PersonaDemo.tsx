"use client";

import { useState, useEffect, useRef } from "react";

interface PersonaMessage {
  persona: string;
  color: string;
  icon: string;
  messages: string[];
}

const personas: PersonaMessage[] = [
  {
    persona: "The Scale Chaser",
    color: "bg-persona-scale",
    icon: "🔴",
    messages: [
      '"Your TAM slide claims $40B but your SAM is only $200M. That\'s a 200x gap — no serious VC buys that."',
      '"Where\'s the moat? Any YC batch could clone this in 8 weeks."',
      '"Show me the compounding flywheel. Without network effects, this is just a feature."',
    ],
  },
  {
    persona: "The Conviction Buyer",
    color: "bg-persona-conviction",
    icon: "🟡",
    messages: [
      '"I love the founder-market fit. You lived this problem — that matters."',
      '"Capital efficiency is strong. ₹12L burn for this traction? I\'m interested."',
      '"But why India first? The wedge needs to be sharper."',
    ],
  },
  {
    persona: "The Reality Check",
    color: "bg-persona-reality",
    icon: "🟢",
    messages: [
      '"Your unit economics don\'t work at ₹499/mo. Show me the path to ₹2000+ ARPU."',
      '"3 LOIs aren\'t traction. Come back with 50 paying users."',
      '"The GTM slide is a wish list, not a plan."',
    ],
  },
];

export function PersonaDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPersona = personas[activeIndex];
  const currentMessage = currentPersona.messages[0];

  useEffect(() => {
    setDisplayText("");
    setCharIndex(0);
  }, [activeIndex]);

  useEffect(() => {
    if (charIndex < currentMessage.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentMessage.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 18 + Math.random() * 12);
    } else {
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % personas.length);
      }, 2500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [charIndex, currentMessage, activeIndex]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
      {personas.map((p, i) => (
        <div
          key={p.persona}
          onClick={() => {
            setActiveIndex(i);
            setCharIndex(0);
            setDisplayText("");
          }}
          className={`flex-1 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-500 backdrop-blur-sm ${
            i === activeIndex
              ? "bg-ink/90 text-white shadow-2xl scale-[1.02]"
              : "bg-white/20 text-white/80 hover:bg-white/30"
          }`}
        >
          {/* Persona header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">{p.icon}</span>
            <div>
              <p className="font-sans text-sm font-medium">{p.persona}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${p.color} ${
                    i === activeIndex ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-[11px] opacity-50">
                  {i === activeIndex ? "Speaking..." : "Waiting"}
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <p
            className={`text-sm leading-relaxed font-serif italic min-h-[60px] ${
              i === activeIndex ? "text-white/90" : "text-white/40"
            }`}
          >
            {i === activeIndex
              ? displayText
              : p.messages[0].slice(0, 40) + "..."}
            {i === activeIndex && charIndex < currentMessage.length && (
              <span className="inline-block w-[2px] h-4 bg-white/60 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
