"use server";

import { z } from "zod";
import { findPlan } from "@/data/serviceAreas";
import { addToWaitlist } from "@/lib/db/waitlist";
import { sendWaitlistJoinedEmail } from "@/lib/email/sendWaitlistEmails";

const inputSchema = z.object({
  planId: z.string().min(1),
  name: z.string().trim().min(2, "Please provide a valid name."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(10, "Please provide your full street address."),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Shared by both the public /signup form and the admin /admin/new form —
 * pure lead capture when a bin size is out of stock. No capacity held, no
 * address geocoding/verification; an admin follows up manually once a unit
 * frees up (see sendSlotAvailableEmail, triggered from releaseHeldSlot).
 */
export async function joinWaitlist(
  input: Input
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check your information." };
  }
  const { planId, name, email, phone, address } = parsed.data;

  const match = findPlan(planId);
  if (!match) {
    return { success: false, error: "That plan is no longer available. Please refresh and try again." };
  }
  const { area, plan } = match;

  try {
    const entry = await addToWaitlist({
      serviceAreaId: area.id,
      binSize: plan.binSize,
      planId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      addressRaw: address,
    });

    const emailResult = await sendWaitlistJoinedEmail(entry);
    if (!emailResult.success) {
      console.error("Waitlist entry created, but admin notification email failed:", emailResult.error);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to join waitlist:", err);
    return { success: false, error: "Something went wrong. Please try again or contact us directly." };
  }
}
