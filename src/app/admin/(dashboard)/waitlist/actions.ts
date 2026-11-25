"use server";

import { redirect } from "next/navigation";
import { resolveWaitlistEntry } from "@/lib/db/waitlist";

export async function resolveAction(id: string): Promise<void> {
  const ok = await resolveWaitlistEntry(id);
  const params = new URLSearchParams({
    ok: String(ok),
    message: ok ? "Marked resolved." : "Already resolved — no action was taken.",
  });
  redirect(`/admin/waitlist?${params.toString()}`);
}
