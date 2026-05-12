"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 backdrop-blur-xl bg-cream-200/80 border-b border-cream-400/60"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Left — Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-ink-400 hover:text-ink transition-colors duration-300"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm text-ink-400 hover:text-ink transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#personas"
            className="text-sm text-ink-400 hover:text-ink transition-colors duration-300"
          >
            Personas
          </a>
        </div>

        {/* Center — Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-serif text-2xl md:text-3xl text-ink tracking-tight">
            Contrario
          </span>
        </Link>

        {/* Right — CTAs */}
        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/auth"
            className="hidden md:block text-sm text-ink-400 hover:text-ink transition-colors duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/analyze"
            className="btn-primary !py-2.5 !px-6 !text-[13px]"
          >
            Try Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
