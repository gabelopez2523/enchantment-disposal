"use server";

import { z } from "zod";
import { SIGNUP_FEE_PRICE_ID, findPlan } from "@/data/serviceAreas";
import { matchAddressToServiceArea } from "@/lib/signupIntake";
import { attachCheckoutSession, reserveSlot, sweepExpiredReservations } from "@/lib/db/reservations";
import { getSiteUrl, stripe } from "@/lib/stripe";

const inputSchema = z.object({
  planId: z.string().min(1),
  name: z.string().trim().min(2, "Please provide a valid name."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().min(7, "Please provide a valid phone number."),
  address: z.string().trim().min(10, "Please provide your full street address."),
});

type Input = z.infer<typeof inputSchema>;

type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string; errorCode?: "outside_service_area" };

export async function createCheckoutSession(input: Input): Promise<CheckoutResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check your information." };
  }
  const { planId, name, email, phone, address } = parsed.data;

  const match = findPlan(planId);
  if (!match) {
    return { success: false, error: "That plan is no longer available. Please refresh and try again." };
  }
  const { area: selectedArea, plan } = match;

  try {
    // Release any abandoned checkout holds before checking capacity — this
    // is the primary mechanism for freeing a slot after cart abandonment
    // (no cron job required); Stripe's own session.expired webhook is a
    // second, idempotent path to the same release.
    await sweepExpiredReservations();

    const addressMatch = await matchAddressToServiceArea(address, selectedArea);

    if ("outside" in addressMatch) {
      return {
        success: false,
        error:
          "Sorry, that address is outside our current service area. Please call or email us if you believe this is a mistake. We will be happy to assist you. Our contact form can be found here.",
        errorCode: "outside_service_area",
      };
    }

    const reservation = await reserveSlot({
      serviceAreaId: addressMatch.serviceAreaId,
      binSize: plan.binSize,
      planId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      addressRaw: address,
      addressFormatted: addressMatch.formatted,
      lat: addressMatch.lat,
      lng: addressMatch.lng,
      verificationReason: addressMatch.verificationReason,
    });

    if (!reservation) {
      return {
        success: false,
        error:
          "We're currently out of stock on that bin size. Please check back later or contact us to be notified when more are available.",
      };
    }

    const siteUrl = getSiteUrl();

    // This phase only collects the one-time signup fee — recurring billing
    // (plan.recurringPriceId) is set up manually, outside Stripe, for now.
    // customer_creation is forced so we still get a Stripe Customer record
    // to reference later, since "payment" mode doesn't create one by default.
    //
    // capture_method: "manual" authorizes the card without charging it —
    // every signup now needs client approval first, so the charge is only
    // captured on Approve (and the hold is simply canceled on Reject, with
    // no charge or refund ever happening either way).
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      customer_creation: "always",
      payment_intent_data: { capture_method: "manual" },
      line_items: [{ price: SIGNUP_FEE_PRICE_ID, quantity: 1 }],
      success_url: `${siteUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/signup/cancel`,
      metadata: { reservationId: reservation.id },
    });

    if (!session.url) {
      // The reservation's hold still has its expiresAt set, so the next
      // checkout attempt's lazy sweep will release it on its own.
      throw new Error("Stripe did not return a Checkout URL.");
    }

    await attachCheckoutSession(reservation.id, session.id);

    return { success: true, url: session.url };
  } catch (err) {
    console.error("Failed to start checkout:", err);
    return {
      success: false,
      error: "Something went wrong starting checkout. Please try again or contact us directly.",
    };
  }
}
