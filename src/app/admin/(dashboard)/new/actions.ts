"use server";

import { z } from "zod";
import { findPlan } from "@/data/serviceAreas";
import { matchAddressToServiceArea } from "@/lib/signupIntake";
import { createManualReservation, getReservationById, type VerificationReason } from "@/lib/db/reservations";
import { sendPendingVerificationEmail } from "@/lib/email/sendPendingVerificationEmail";

const inputSchema = z.object({
  planId: z.string().min(1),
  name: z.string().trim().min(2, "Please provide a valid name."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(10, "Please provide a full street address."),
  stripePaymentIntentId: z.string().trim().optional(),
  // Set once the admin has confirmed the "outside service area" warning —
  // lets this address through despite matching no defined service area.
  overrideOutsideArea: z.boolean().optional(),
});

type Input = z.infer<typeof inputSchema>;

type CreateManualSignupResult =
  | { success: true; reservationId: string }
  | { success: false; error: string; errorCode?: "outside_service_area" | "out_of_stock" };

/**
 * The web equivalent of scripts/manualSignup.ts — same pipeline, same
 * pending_verification result and admin email, for staff who aren't going
 * to use a terminal. Payment (if collected via Stripe at all) still has to
 * be set up separately as a manual-capture PaymentIntent elsewhere (a
 * Payment Link or Virtual Terminal charge); its id is optional here so
 * Approve/Reject can still capture/cancel it automatically when provided.
 */
export async function createManualSignup(input: Input): Promise<CreateManualSignupResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the information." };
  }
  const { planId, name, email, phone, address, stripePaymentIntentId, overrideOutsideArea } = parsed.data;

  const match = findPlan(planId);
  if (!match) {
    return { success: false, error: "That plan is no longer available. Please refresh and try again." };
  }
  const { area: selectedArea, plan } = match;

  const addressMatch = await matchAddressToServiceArea(address, selectedArea);

  let serviceAreaId: string;
  let verificationReason: VerificationReason;
  let lat: number | undefined;
  let lng: number | undefined;
  let formatted: string | undefined;

  if ("outside" in addressMatch) {
    if (!overrideOutsideArea) {
      return {
        success: false,
        error: "That address is outside the current service area.",
        errorCode: "outside_service_area",
      };
    }
    // Admin confirmed the override — there's no real geographic match to
    // use, so fall back to the plan's own area (same as a failed geocode).
    serviceAreaId = selectedArea.id;
    verificationReason = "admin_override";
    lat = addressMatch.lat;
    lng = addressMatch.lng;
    formatted = addressMatch.formatted;
  } else {
    serviceAreaId = addressMatch.serviceAreaId;
    verificationReason = addressMatch.verificationReason;
    lat = addressMatch.lat;
    lng = addressMatch.lng;
    formatted = addressMatch.formatted;
  }

  const created = await createManualReservation({
    serviceAreaId,
    binSize: plan.binSize,
    planId,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    addressRaw: address,
    addressFormatted: formatted,
    lat,
    lng,
    verificationReason,
    stripePaymentIntentId,
  });

  if (!created) {
    return {
      success: false,
      error: `Out of stock for bin size "${plan.binSize}" — not reserving a slot. You can add this customer to the waitlist instead.`,
      errorCode: "out_of_stock",
    };
  }

  const reservation = await getReservationById(created.id);
  if (reservation) {
    const emailResult = await sendPendingVerificationEmail(reservation);
    if (!emailResult.success) {
      console.error("Manual signup created, but admin notification email failed:", emailResult.error);
    }
  }

  return { success: true, reservationId: created.id };
}
