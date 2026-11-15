import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  expireReservationByPaymentIntentId,
  expireReservationBySessionId,
  finalizeReservationPayment,
} from "@/lib/db/reservations";
import { sendPendingVerificationEmail } from "@/lib/email/sendPendingVerificationEmail";

// This is the repo's first API route — required because Server Actions
// can't receive the raw, signature-verifiable body Stripe webhooks need.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // This phase only collects the one-time signup fee via a "payment"
        // mode session (no subscription is created) — customer_creation:
        // "always" guarantees session.customer is set.
        if (session.mode !== "payment" || !session.customer || !session.payment_intent) {
          break; // not our checkout flow
        }

        const reservationIdFromMetadata = session.metadata?.reservationId;
        if (!reservationIdFromMetadata) break;

        const updated = await finalizeReservationPayment(session.id, {
          customerId:
            typeof session.customer === "string" ? session.customer : session.customer.id,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id,
        });

        // Every signup lands in pending_verification now (capture_method:
        // "manual" — nothing is charged yet, so there's nothing else to do
        // here besides notify the admin).
        if (updated) {
          const result = await sendPendingVerificationEmail(updated);
          if (!result.success) {
            console.error("Failed to send pending-verification email for reservation", updated.id);
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await expireReservationBySessionId(session.id);
        break;
      }

      case "payment_intent.canceled": {
        // Stripe auto-cancels an uncaptured authorization after its hold
        // window passes (~7 days) if nobody captured it — release the slot
        // if the admin never acted on it.
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await expireReservationByPaymentIntentId(paymentIntent.id);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook event:", event.type, err);
    // 500 so Stripe retries — the DB guards make every handler idempotent.
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }
}
