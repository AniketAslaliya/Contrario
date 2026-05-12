#!/usr/bin/env node
/**
 * Applies supabase/migrations/*.sql to a remote Postgres (e.g. Supabase).
 *
 * SECURITY: Never commit DATABASE_URL. Use .env.local (gitignored) or env var only.
 * Do not paste your DB password into chat logs.
 *
 * Usage:
 *   npm run db:migrate
 *
 * Requires DATABASE_URL (optional copy in .env.local):
 *   postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres
 *
 * If you see ENOTFOUND, the direct db.* host may be IPv6-only on Supabase.
 * Use the Session pooler URI from Dashboard → Connect (port 6543, host aws-0-….pooler.supabase.com).
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.resolve(__dirname, "..");
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

async function main() {
  loadEnvLocal();
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error(
      "Missing DATABASE_URL. Add it to .env.local (see .env.example) or export it, then rerun."
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  console.log(`Connecting → ${maskUrl(dbUrl)}`);
  await client.connect();

  try {
    for (const file of files) {
      const full = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(full, "utf8");
      console.log(`Applying ${file} …`);
      await client.query(sql);
    }
    console.log("Done. All migration files applied in order.");
  } finally {
    await client.end();
  }
}

function maskUrl(url) {
  try {
    const u = new URL(url);
    if (u.password) u.password = "****";
    return u.toString();
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

main().catch((err) => {
  const code = err && err.code;
  const msg = err && err.message ? String(err.message) : String(err);
  console.error(msg);
  if (code === "ENOTFOUND" || code === "EAI_AGAIN" || /ENOTFOUND/i.test(msg)) {
    console.error("");
    console.error(
      "DNS could not resolve the host, or Supabase returned only IPv6 and your network has no IPv6 route."
    );
    console.error(
      "Fix: In Supabase → Project Settings → Database → Connection string, choose"
    );
    console.error(
      "  “Session pooler” (or “URI” mode that uses aws-0-<region>.pooler.supabase.com:6543)."
    );
    console.error(
      "  Use user format postgres.<project-ref> and your DB password — not the anon key."
    );
    console.error(
      "Optional: set Windows DNS to 8.8.8.8 or test: nslookup <host> 8.8.8.8"
    );
  }
  process.exit(1);
});
