// Shared Approve/Reject/Cancel logic for a reservation — used by BOTH the
// email action links (src/app/api/admin/verify/route.ts) and the admin
// dashboard (src/app/admin/(dashboard)/reservations/[id]/actions.ts), so
// the two entry points can never drift apart on side effects (Stripe
// capture/cancel, bin-inventory release, notification emails).

import {
  cancelActiveReservation,
  releaseUncommittedReservation,
  resolveVerification,
} from "@/lib/db/reservations";
import { sendActiveSignupEmail } from "@/lib/email/sendActiveSignupEmail";
import { stripe } from "@/lib/stripe";

export interface AdminActionResult {
  ok: boolean;
  message: string;
}

export async function approveReservation(reservationId: string): Promise<AdminActionResult> {
  const { ok, reservation } = await resolveVerification(reservationId, "approve");

  if (!ok || !reservation) {
    return {
      ok: false,
      message: "This signup has already been approved, rejected, or is no longer pending verification — no action was taken.",
    };
  }

  // Capture the authorized charge — the first time any money actually
  // moves (capture_method: "manual" authorized it at checkout but never
  // charged it until now).
  try {
    if (reservation.stripePaymentIntentId) {
      await stripe.paymentIntents.capture(reservation.stripePaymentIntentId);
    }
  } catch (err) {
    console.error("Failed to capture approved reservation's authorization in Stripe:", err);
    return {
      ok: true,
      message: `${reservation.customerName}'s signup is marked active in our system, but capturing their card authorization in Stripe failed (it may have expired) — you'll need to charge them another way and confirm with them directly.`,
    };
  }

  const emailResult = await sendActiveSignupEmail(reservation);
  if (!emailResult.success) {
    console.error("Failed to send active-signup email after approval for reservation", reservation.id);
  }

  const chargeNote = reservation.stripePaymentIntentId
    ? "their card was charged, and"
    : "no Stripe PaymentIntent was attached to charge, so remember to collect payment separately, and";

  return {
    ok: true,
    message: `${reservation.customerName}'s signup was approved, ${chargeNote} their service is now active.`,
  };
}

export async function rejectReservation(reservationId: string): Promise<AdminActionResult> {
  const { ok, reservation } = await resolveVerification(reservationId, "reject");

  if (!ok || !reservation) {
    return {
      ok: false,
      message: "This signup has already been approved, rejected, or is no longer pending verification — no action was taken.",
    };
  }

  // The card was only authorized, never charged — canceling the
  // authorization releases the hold with no charge or refund ever happening.
  try {
    if (reservation.stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(reservation.stripePaymentIntentId);
    }
  } catch (err) {
    console.error("Failed to cancel rejected reservation's authorization in Stripe:", err);
    return {
      ok: true,
      message: "The reservation was rejected and its slot released, but canceling the card authorization in Stripe failed — please check the Stripe dashboard; it may need to be voided manually, or it will expire on its own.",
    };
  }

  const chargeNote = reservation.stripePaymentIntentId
    ? "the card authorization was canceled — no charge was ever made"
    : "no Stripe PaymentIntent was attached, so there was nothing to cancel";

  return {
    ok: true,
    message: `${reservation.customerName}'s signup was rejected, their slot was released, and ${chargeNote}.`,
  };
}

// For a reservation stuck in pending_payment — a customer started checkout
// and never finished (no card details submitted, or they abandoned the
// Stripe page). No money was ever collected, so there's nothing to cancel
// in Stripe here, unlike the other three actions above.
export async function releaseAbandonedReservation(reservationId: string): Promise<AdminActionResult> {
  const { ok, reservation } = await releaseUncommittedReservation(reservationId);

  if (!ok || !reservation) {
    return {
      ok: false,
      message:
        "This signup is no longer awaiting payment (it already completed, expired, or was already released) — no action was taken.",
    };
  }

  return {
    ok: true,
    message: `${reservation.customerName}'s abandoned checkout was released and their slot freed up. No payment was ever collected for this attempt.`,
  };
}

export async function cancelReservation(reservationId: string): Promise<AdminActionResult> {
  const { ok, reservation } = await cancelActiveReservation(reservationId);

  if (!ok || !reservation) {
    return {
      ok: false,
      message: "This signup is no longer active (already canceled, or never reached active) — no action was taken.",
    };
  }

  return {
    ok: true,
    message: `${reservation.customerName}'s service was marked canceled and their slot was released. This does not refund the signup fee.`,
  };
}
