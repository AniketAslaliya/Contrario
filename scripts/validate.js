#!/usr/bin/env node
/**
 * CONTRARIO — Validation Script
 * Run: node scripts/validate.js
 * Run specific module: node scripts/validate.js --module=M06
 * Run pre-deploy: node scripts/validate.js --pre-deploy
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const moduleArg = args.find((a) => a.startsWith("--module="))?.split("=")[1];
const preDeploy = args.includes("--pre-deploy");

// ─── Colours ────────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};
const ok = (msg) => console.log(`  ${C.green}✓${C.reset} ${msg}`);
const fail = (msg) => console.log(`  ${C.red}✗${C.reset} ${msg}`);
const warn = (msg) => console.log(`  ${C.yellow}⚠${C.reset} ${msg}`);
const info = (msg) => console.log(`  ${C.cyan}→${C.reset} ${msg}`);
const header = (msg) =>
  console.log(`\n${C.bold}${C.magenta}▸ ${msg}${C.reset}`);
const divider = () => console.log(C.dim + "─".repeat(60) + C.reset);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(condition, passMsg, failMsg) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    ok(passMsg);
    return true;
  } else {
    failedChecks++;
    fail(failMsg);
    return false;
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function fileContains(relPath, str) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), "utf8").includes(str);
  } catch {
    return false;
  }
}

function envExists(key) {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return false;
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match && match[1].trim().length > 0;
}

/** Raw value from .env.local (empty string if missing). */
function envRaw(key) {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return "";
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

/** Mirrors lib/ai-provider.ts — default is gemini when unset. */
function activeAiBackend() {
  const raw = envRaw("AI_PROVIDER").toLowerCase();
  if (raw === "anthropic" || raw === "claude") return "anthropic";
  return "gemini";
}

function fetchUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client
      .get(url, { timeout }, (res) => {
        resolve({ status: res.statusCode, ok: res.statusCode < 400 });
      })
      .on("error", () => resolve({ status: 0, ok: false }))
      .on("timeout", () => {
        req.destroy();
        resolve({ status: 0, ok: false });
      });
  });
}

// ─── Module Validators ───────────────────────────────────────────────────────

const validators = {
  M00: () => {
    header("M00 · Foundation Docs");
    check(fileExists("docs/PRD.md"), "PRD.md exists", "PRD.md MISSING");
    check(
      fileExists("docs/CONTEXT.md"),
      "CONTEXT.md exists",
      "CONTEXT.md MISSING"
    );
    check(fileExists("README.md"), "README.md exists", "README.md MISSING");
    check(
      fileExists("docs/ROADMAP.md"),
      "ROADMAP.md exists",
      "ROADMAP.md MISSING"
    );
    check(
      fileExists("scripts/validate.js"),
      "validate.js exists",
      "validate.js MISSING"
    );
    check(
      fileContains("docs/CONTEXT.md", "Session 001"),
      "CONTEXT.md has session log",
      "CONTEXT.md missing session log"
    );
    check(
      fileContains("docs/PRD.md", "Three investors"),
      "PRD has tagline",
      "PRD missing tagline"
    );
    check(
      fileContains("docs/ROADMAP.md", "M25"),
      "ROADMAP has all 25 modules",
      "ROADMAP missing modules"
    );
  },

  M01: () => {
    header("M01 · Landing / Hero Page");
    check(
      fileExists("app/page.tsx") || fileExists("app/page.jsx"),
      "Landing page file exists",
      "Landing page file MISSING"
    );
    check(
      fileContains("app/page.tsx", "Zero consensus") ||
        fileContains("app/page.jsx", "Zero consensus") ||
        fileContains("app/page.tsx", "Zero&nbsp;consensus") ||
        fileContains("app/page.jsx", "Zero&nbsp;consensus"),
      "Tagline present in hero",
      "Tagline missing from hero"
    );
    check(
      fileContains("app/page.tsx", "/analyze") ||
        fileContains("app/page.jsx", "/analyze"),
      "CTA links to /analyze",
      "CTA link to /analyze MISSING"
    );
    check(
      fileContains("app/page.tsx", "/auth") ||
        fileContains("app/page.jsx", "/auth"),
      "Sign up CTA links to /auth",
      "Sign up CTA MISSING"
    );
    warn("Manually check: dark premium design, mobile responsive, LCP < 1.5s");
  },

  M02: () => {
    header("M02 · Authentication");
    check(
      fileExists("app/auth/page.tsx") ||
        fileExists("app/auth/page.jsx") ||
        fileExists("pages/auth/signin.tsx"),
      "Auth page exists",
      "Auth page MISSING"
    );
    check(
      fileExists("app/api/auth/[...nextauth]/route.ts") ||
        fileExists("pages/api/auth/[...nextauth].ts"),
      "NextAuth route exists",
      "NextAuth route MISSING"
    );
    check(
      fileExists("lib/auth.ts") || fileContains("app/api/auth/[...nextauth]/route.ts", "GoogleProvider"),
      "Google provider configured",
      "Google provider NOT configured"
    );
    check(envExists("NEXTAUTH_SECRET"), "NEXTAUTH_SECRET set", "NEXTAUTH_SECRET MISSING in .env.local");
    check(envExists("GOOGLE_CLIENT_ID"), "GOOGLE_CLIENT_ID set", "GOOGLE_CLIENT_ID MISSING in .env.local");
    check(envExists("GOOGLE_CLIENT_SECRET"), "GOOGLE_CLIENT_SECRET set", "GOOGLE_CLIENT_SECRET MISSING in .env.local");
    warn("Manually test: full Google OAuth flow, session persists on refresh");
  },

  M03: () => {
    header("M03 · User Role Onboarding");
    check(
      fileExists("app/onboarding/page.tsx") ||
        fileExists("app/onboarding/page.jsx"),
      "Onboarding page exists",
      "Onboarding page MISSING"
    );
    check(
      fileContains("app/onboarding/page.tsx", "Founder") ||
        fileContains("app/onboarding/page.jsx", "Founder"),
      "Founder role option present",
      "Founder role MISSING"
    );
    check(
      fileContains("app/onboarding/page.tsx", "Accelerator") ||
        fileContains("app/onboarding/page.jsx", "Accelerator"),
      "Accelerator role option present",
      "Accelerator role MISSING"
    );
    warn("Manually test: role saved to Supabase, shows only on first login");
  },

  M04: () => {
    header("M04 · PDF Upload + Text Extraction");
    check(
      fileExists("app/api/parse-pdf/route.ts") ||
        fileExists("app/api/parse-pdf/route.js"),
      "PDF parse API route exists",
      "PDF parse API route MISSING"
    );
    check(
      fileExists("lib/pdf-parser.ts") || fileExists("lib/pdf-parser.js"),
      "PDF parser utility exists",
      "PDF parser utility MISSING"
    );
    check(
      fileContains("package.json", "pdf-parse"),
      "pdf-parse in package.json",
      "pdf-parse NOT in package.json — run: npm install pdf-parse"
    );
    check(
      fileContains("app/api/parse-pdf/route.ts", "10") ||
        fileContains("app/api/parse-pdf/route.ts", "maxSize") ||
        fileContains("app/api/parse-pdf/route.js", "10"),
      "File size limit enforced",
      "File size limit NOT enforced (add 10MB check)"
    );
    warn("Manually test: valid PDF extracts text, oversized PDF rejected, corrupt PDF shows error");
  },

  M05: () => {
    header("M05 · Text / Idea Paste Input");
    check(
      fileExists("components/upload/TextInput.tsx") ||
        fileExists("components/upload/TextInput.jsx") ||
        fileExists("components/TextInput.tsx"),
      "TextInput component exists",
      "TextInput component MISSING"
    );
    warn("Manually test: min 100 chars enforced, max 5000 enforced, tab toggle between PDF and text");
  },

  M06: () => {
    header("M06 · Three-Persona Streaming Analysis Engine ⚡ CORE");
    check(
      fileExists("app/api/analyze/route.ts") ||
        fileExists("app/api/analyze/route.js"),
      "Analyze API route exists",
      "Analyze API route MISSING"
    );
    check(
      fileExists("lib/personas.ts") || fileExists("lib/personas.js"),
      "Personas file exists",
      "personas.ts MISSING — system prompts must live here"
    );
    check(
      fileExists("lib/anthropic.ts") || fileExists("lib/anthropic.js"),
      "Anthropic client utility exists",
      "Anthropic client MISSING"
    );
    check(
      fileExists("lib/gemini.ts") || fileExists("lib/gemini.js"),
      "Gemini client utility exists",
      "Gemini client MISSING"
    );
    check(
      fileExists("lib/ai-provider.ts") || fileExists("lib/ai-provider.js"),
      "AI provider switch (lib/ai-provider) exists",
      "lib/ai-provider.ts MISSING"
    );

    const backend = activeAiBackend();
    const hasGemini = envExists("GEMINI_API_KEY");
    const hasAnthropic = envExists("ANTHROPIC_API_KEY");
    check(
      hasGemini || hasAnthropic,
      "At least one LLM key is set (GEMINI_API_KEY and/or ANTHROPIC_API_KEY)",
      "No LLM API key found — add GEMINI_API_KEY or ANTHROPIC_API_KEY to .env.local"
    );
    if (backend === "gemini" && !hasGemini && hasAnthropic) {
      warn(
        "AI_PROVIDER is gemini (default) but only ANTHROPIC_API_KEY is set — set GEMINI_API_KEY or AI_PROVIDER=anthropic"
      );
    }
    if (backend === "anthropic" && !hasAnthropic && hasGemini) {
      warn(
        "AI_PROVIDER=anthropic but only GEMINI_API_KEY is set — set ANTHROPIC_API_KEY or use default Gemini"
      );
    }
    if (backend === "gemini") {
      check(
        fileContains("package.json", "@google/generative-ai"),
        "@google/generative-ai in package.json",
        "@google/generative-ai NOT installed — run: npm install @google/generative-ai"
      );
    } else {
      check(
        fileContains("package.json", "@anthropic-ai/sdk"),
        "@anthropic-ai/sdk in package.json",
        "@anthropic-ai/sdk NOT in package.json — run: npm install @anthropic-ai/sdk"
      );
    }

    // Check for parallel calls (Promise.all)
    const analyzeRoute =
      fs.existsSync(path.join(ROOT, "app/api/analyze/route.ts"))
        ? fs.readFileSync(path.join(ROOT, "app/api/analyze/route.ts"), "utf8")
        : fs.existsSync(path.join(ROOT, "app/api/analyze/route.js"))
        ? fs.readFileSync(path.join(ROOT, "app/api/analyze/route.js"), "utf8")
        : "";
    check(
      analyzeRoute.includes("Promise.all") || analyzeRoute.includes("Promise.allSettled"),
      "Parallel API calls using Promise.all ✓",
      "NOT using Promise.all — personas are sequential! Fix this immediately."
    );
    check(
      analyzeRoute.includes("stream") || analyzeRoute.includes("Stream"),
      "Streaming response detected",
      "Streaming NOT implemented — add SSE/ReadableStream"
    );

    // Check personas file has all 3
    const personasFile =
      fs.existsSync(path.join(ROOT, "lib/personas.ts"))
        ? fs.readFileSync(path.join(ROOT, "lib/personas.ts"), "utf8")
        : fs.existsSync(path.join(ROOT, "lib/personas.js"))
        ? fs.readFileSync(path.join(ROOT, "lib/personas.js"), "utf8")
        : "";
    check(personasFile.includes("scale-chaser") || personasFile.includes("Scale Chaser"), "Scale Chaser persona defined", "Scale Chaser persona MISSING");
    check(personasFile.includes("conviction-buyer") || personasFile.includes("Conviction Buyer"), "Conviction Buyer persona defined", "Conviction Buyer persona MISSING");
    check(personasFile.includes("reality-check") || personasFile.includes("Reality Check"), "Reality Check persona defined", "Reality Check persona MISSING");

    check(
      fileContains("package.json", "@anthropic-ai/sdk") &&
        fileContains("package.json", "@google/generative-ai"),
      "Both LLM SDKs in package.json (Anthropic + Gemini)",
      "Add missing @anthropic-ai/sdk and/or @google/generative-ai to package.json"
    );
    check(
      fileExists("lib/synthesis/post-analysis.ts") ||
        fileExists("lib/synthesis/post-analysis.js"),
      "lib/synthesis/post-analysis exists",
      "lib/synthesis/post-analysis.ts MISSING — M07/M08 synthesis"
    );
    check(
      fileContains("app/api/analyze/route.ts", "synthesizeConflictAndFlags"),
      "Analyze route calls synthesizeConflictAndFlags after streams",
      "M07: wire synthesizeConflictAndFlags in app/api/analyze/route.ts"
    );
    warn("Manually test: all 3 streams fire simultaneously (check Network tab), first token < 3s");
  },

  M07: () => {
    header("M07 · Conflict Map Output UI");
    check(
      fileExists("components/persona-card") ||
        fileExists("components/PersonaCard.tsx") ||
        fileExists("components/PersonaCard.jsx"),
      "PersonaCard component exists",
      "PersonaCard component MISSING"
    );
    check(
      fileExists("components/conflict-map") ||
        fileExists("components/ConflictMap.tsx") ||
        fileExists("components/ConflictMap.jsx"),
      "ConflictMap component exists",
      "ConflictMap component MISSING"
    );
    check(
      fileContains("app/analyze/AnalyzeWorkspace.tsx", "ConflictMap"),
      "Analyze page imports ConflictMap",
      "M07: render ConflictMap in app/analyze/AnalyzeWorkspace.tsx"
    );
    warn("Manually test: 3-column layout, mobile stacks, conflict zones highlighted, streaming animation smooth");
  },

  M08: () => {
    header("M08 · Consensus Red Flags Summary");
    check(
      fileExists("components/RedFlagsSummary.tsx") ||
        fileExists("components/RedFlagsSummary.jsx") ||
        fileExists("components/consensus"),
      "RedFlagsSummary component exists",
      "RedFlagsSummary component MISSING"
    );
    check(
      fileContains("app/analyze/AnalyzeWorkspace.tsx", "RedFlagsSummary"),
      "Analyze page imports RedFlagsSummary",
      "M08: render RedFlagsSummary in app/analyze/AnalyzeWorkspace.tsx"
    );
    warn("Manually test: appears after all 3 streams complete, shows max 3 items, red-tinted styling");
  },

  M10: () => {
    header("M10 · Founder Dashboard — Session History");
    check(
      fileExists("app/dashboard/page.tsx") ||
        fileExists("app/dashboard/page.jsx"),
      "Dashboard page exists",
      "Dashboard page MISSING"
    );
    check(
      envExists("NEXT_PUBLIC_SUPABASE_URL"),
      "Supabase URL configured",
      "NEXT_PUBLIC_SUPABASE_URL MISSING"
    );
    check(
      envExists("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Supabase anon key configured",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY MISSING"
    );
    warn("Manually test: past analyses listed, click opens full analysis, empty state shown");
  },

  M12: () => {
    header("M12 · Shareable Report Link");
    check(
      fileExists("app/r/[slug]/page.tsx") ||
        fileExists("app/r/[slug]/page.jsx") ||
        fileExists("app/report/[slug]/page.tsx"),
      "Public report route exists",
      "Public report route MISSING — create app/r/[slug]/page.tsx"
    );
    warn("Manually test: link works without login, shows full analysis, expiry works");
  },

  M20: () => {
    header("M20 · India Context Mode");
    check(
      fileContains("lib/personas.ts", "India") ||
        fileContains("lib/personas.js", "India") ||
        fileContains("lib/personas.ts", "INR"),
      "India context references in personas",
      "India context NOT in personas.ts — add INR, India TAM, UPI references"
    );
    warn("Manually test: toggle ON adds India-specific benchmarks, toggle OFF uses global lens");
  },

  M24: () => {
    header("M24 · Waitlist + Referral System");
    check(
      fileExists("app/waitlist/page.tsx") ||
        fileExists("app/waitlist/page.jsx") ||
        fileContains("app/page.tsx", "waitlist") ||
        fileContains("app/page.jsx", "waitlist"),
      "Waitlist page or section exists",
      "Waitlist MISSING"
    );
    warn("Manually test: form submits, referral link generated, referral count tracked");
  },
};

// ─── Pre-Deploy Checklist ────────────────────────────────────────────────────

async function preDeployChecks() {
  header("PRE-DEPLOY CHECKLIST");
  divider();

  // Env vars
  header("Environment Variables");
  const envVars = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  envVars.forEach((v) => check(envExists(v), `${v} is set`, `${v} MISSING`));

  header("AI provider (see lib/ai-provider.ts)");
  const hasGemini = envExists("GEMINI_API_KEY");
  const hasAnthropic = envExists("ANTHROPIC_API_KEY");
  check(
    hasGemini || hasAnthropic,
    "At least one LLM key (GEMINI_API_KEY and/or ANTHROPIC_API_KEY)",
    "No LLM API key — add GEMINI_API_KEY or ANTHROPIC_API_KEY"
  );
  if (activeAiBackend() === "gemini" && !hasGemini && hasAnthropic) {
    warn(
      "AI_PROVIDER is gemini (default) but only ANTHROPIC_API_KEY is set — set GEMINI_API_KEY or AI_PROVIDER=anthropic"
    );
  }
  if (activeAiBackend() === "anthropic" && !hasAnthropic && hasGemini) {
    warn(
      "AI_PROVIDER=anthropic but only GEMINI_API_KEY is set — set ANTHROPIC_API_KEY or use default Gemini"
    );
  }

  // Critical files
  header("Critical Files");
  [
    "app/page.tsx",
    "app/api/analyze/route.ts",
    "lib/personas.ts",
    "lib/anthropic.ts",
    "lib/gemini.ts",
    "lib/ai-provider.ts",
    "docs/CONTEXT.md",
  ].forEach((f) => {
    const exists = fileExists(f) || fileExists(f.replace(".ts", ".tsx")) || fileExists(f.replace(".ts", ".js"));
    check(exists, `${f} exists`, `${f} MISSING`);
  });

  // Package checks
  header("Dependencies");
  ["@anthropic-ai/sdk", "@google/generative-ai", "pdf-parse", "next-auth"].forEach((pkg) => {
    check(
      fileContains("package.json", pkg),
      `${pkg} in package.json`,
      `${pkg} MISSING — npm install ${pkg}`
    );
  });

  // Live URL check (if NEXTAUTH_URL is set)
  const envPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const urlMatch = content.match(/^NEXTAUTH_URL=(.+)$/m);
    if (urlMatch && urlMatch[1].startsWith("http")) {
      header("Live URL Check");
      info(`Checking ${urlMatch[1]}...`);
      const result = await fetchUrl(urlMatch[1].trim());
      check(result.ok, `Site is live at ${urlMatch[1]}`, `Site NOT reachable at ${urlMatch[1]}`);
    }
  }

  // CONTEXT.md session log updated
  header("Documentation");
  check(
    fileContains("docs/CONTEXT.md", "Session"),
    "CONTEXT.md has session log",
    "CONTEXT.md missing session log — update before deploying"
  );
  check(
    fileContains("docs/CONTEXT.md", "✅"),
    "CONTEXT.md has completed modules marked",
    "CONTEXT.md module status not updated"
  );
}

// ─── Run ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(
    `\n${C.bold}${C.cyan}CONTRARIO — Validation Script${C.reset}`
  );
  console.log(C.dim + `"Three investors. One deck. Zero consensus."` + C.reset);
  divider();

  if (preDeploy) {
    await preDeployChecks();
  } else if (moduleArg) {
    const validator = validators[moduleArg];
    if (!validator) {
      console.log(`${C.red}Unknown module: ${moduleArg}${C.reset}`);
      console.log(`Available: ${Object.keys(validators).join(", ")}`);
      process.exit(1);
    }
    validator();
  } else {
    // Run all available validators
    Object.values(validators).forEach((v) => {
      v();
      divider();
    });
  }

  // Summary
  divider();
  console.log(`\n${C.bold}Results:${C.reset}`);
  console.log(`  ${C.green}Passed:${C.reset}  ${passedChecks}/${totalChecks}`);
  if (failedChecks > 0) {
    console.log(`  ${C.red}Failed:${C.reset}  ${failedChecks}/${totalChecks}`);
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const scoreColor = score >= 90 ? C.green : score >= 70 ? C.yellow : C.red;
  console.log(`  ${C.bold}Score:${C.reset}   ${scoreColor}${score}%${C.reset}`);

  if (failedChecks === 0) {
    console.log(`\n${C.green}${C.bold}✓ All checks passed. Ship it.${C.reset}\n`);
  } else {
    console.log(`\n${C.yellow}Fix the issues above before deploying.${C.reset}\n`);
  }

  process.exit(failedChecks > 0 ? 1 : 0);
}

run().catch(console.error);