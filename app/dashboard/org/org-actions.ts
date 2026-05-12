"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import {
  createOrganization,
  joinOrganizationByCode,
  updateOrgPersonaWeights,
  isOrgAdmin,
} from "@/lib/org-store";
import type { PersonaId } from "@/lib/personas";
import type { UserRole } from "@/lib/user-role";

const ORG_ROLES: UserRole[] = ["accelerator", "mentor"];

export async function createOrgAction(name: string): Promise<
  { ok: true; inviteCode: string } | { ok: false; message: string }
> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  const profile = await getProfileByUserId(userId).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!role || !ORG_ROLES.includes(role)) {
    return { ok: false, message: "Accelerator or mentor accounts only." };
  }

  const n = name.trim();
  if (n.length < 2) return { ok: false, message: "Enter an organization name." };

  try {
    const { inviteCode } = await createOrganization({ userId, name: n });
    return { ok: true, inviteCode };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create org.",
    };
  }
}

export async function joinOrgAction(code: string): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  const profile = await getProfileByUserId(userId).catch(() => null);
  const role = profile?.role as UserRole | undefined;
  if (!role || !ORG_ROLES.includes(role)) {
    return { ok: false, message: "Accelerator or mentor accounts only." };
  }

  try {
    await joinOrganizationByCode({ userId, code });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not join org.",
    };
  }
}

export async function saveOrgWeightsAction(
  orgId: string,
  weights: Record<PersonaId, number>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return { ok: false, message: "Sign in required." };

  const okAdmin = await isOrgAdmin(userId, orgId);
  if (!okAdmin) return { ok: false, message: "Org admin only." };

  try {
    await updateOrgPersonaWeights(orgId, weights);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Save failed.",
    };
  }
}
