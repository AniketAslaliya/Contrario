"use server";

import {
  insertWaitlistEntry,
  countReferralsByCode,
} from "@/lib/waitlist-store";

export async function submitWaitlistAction(formData: FormData): Promise<
  | { ok: true; referralCode: string; referralCount: number }
  | { ok: false; message: string }
> {
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const referredBy = String(formData.get("referred_by") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email." };
  }

  try {
    const { code } = await insertWaitlistEntry({
      email,
      name: name || null,
      referredBy: referredBy || null,
    });
    const referralCount = await countReferralsByCode(code);
    return { ok: true, referralCode: code, referralCount };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not join waitlist.",
    };
  }
}
