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
 * If IPv4 issues on your network, use the Session pooler URI from Supabase Connect instead.
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
  console.error(err.message || err);
  process.exit(1);
});
