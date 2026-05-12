import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm beige background palette (Claura-inspired)
        cream: {
          50: "#FDFBF7",
          100: "#F9F5ED",
          200: "#F4F1ED",
          300: "#EDE8E0",
          400: "#E0D9CE",
          500: "#D4CCBF",
        },
        // Deep warm dark tones
        ink: {
          DEFAULT: "#1A1A1A",
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#8A8A8A",
          500: "#6B6B6B",
          600: "#4A4A4A",
          700: "#333333",
          800: "#262626",
          900: "#1A1A1A",
        },
        // Persona colors (warm and organic)
        persona: {
          scale: "#C45A3C",       // Warm terracotta red
          "scale-light": "#E8B4A4",
          conviction: "#B8860B",  // Rich gold
          "conviction-light": "#E8D5A0",
          reality: "#2D7D6B",    // Deep teal
          "reality-light": "#A3D5C9",
        },
        // Accent — warm brown (Claura CTA)
        accent: {
          DEFAULT: "#3D2B1F",
          light: "#5C4030",
          hover: "#2A1D15",
        },
        // Soft gradient palette
        warm: {
          orange: "#FF9D66",
          peach: "#FFD0A5",
          rose: "#E8A598",
        },
        cool: {
          teal: "#2DD4BF",
          mint: "#A3E635",
          sage: "#6B9080",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Georgia'", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.7s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
