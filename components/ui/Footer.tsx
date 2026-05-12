import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-glow flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              Contrario
            </span>
          </div>

          <p className="text-sm text-zinc-600">
            Built by{" "}
            <a
              href="https://aniketaslaliya.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Aniket Aslaliya
            </a>{" "}
            for the Activate AI Fellows Program — Summer 2026
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/AniketAslaliya/Contrario"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/auth"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
