/** Admin gate: comma-separated emails in CONTRARIO_ADMIN_EMAILS */
export function isContrarioAdmin(email: string | null | undefined): boolean {
  const raw = process.env.CONTRARIO_ADMIN_EMAILS?.trim();
  if (!raw || !email) return false;
  const allowed = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowed.has(email.trim().toLowerCase());
}
