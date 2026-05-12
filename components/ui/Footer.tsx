import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cream-400/60 py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
          <div>
            <Link href="/">
              <span className="font-serif text-3xl text-ink tracking-tight">
                Contrario
              </span>
            </Link>
            <p className="text-ink-400 text-sm mt-3 max-w-xs leading-relaxed">
              Three investors. One deck. Zero consensus.
              <br />
              The adversarial pitch intelligence platform.
            </p>
          </div>

          <div className="flex gap-16 md:gap-20">
            <div>
              <p className="font-sans text-xs text-ink-300 uppercase tracking-[0.15em] mb-4">
                Product
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Analyze", href: "/analyze" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Features", href: "#features" },
                  { label: "Personas", href: "#personas" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-400 hover:text-ink transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-sans text-xs text-ink-300 uppercase tracking-[0.15em] mb-4">
                Connect
              </p>
              <ul className="space-y-3">
                {[
                  {
                    label: "GitHub",
                    href: "https://github.com/AniketAslaliya/Contrario",
                  },
                  {
                    label: "LinkedIn",
                    href: "https://linkedin.com/in/aniket-aslaliya",
                  },
                  {
                    label: "Portfolio",
                    href: "https://aniketaslaliya.dev",
                  },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-400 hover:text-ink transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-300">
            © {new Date().getFullYear()} Contrario. Built by Aniket Aslaliya.
          </p>
          <p className="text-xs text-ink-300">
            Activate AI Fellows — Summer 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
