/** Shared role enums + default route after onboarding (no server-only deps). */

export const USER_ROLES = [
  "founder",
  "student",
  "accelerator",
  "angel",
  "mentor",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

/** Where each persona lands after onboarding (PRD-aligned). */
export function getHomePathForRole(role: UserRole): "/analyze" | "/dashboard" {
  if (role === "accelerator" || role === "mentor") return "/dashboard";
  return "/analyze";
}
