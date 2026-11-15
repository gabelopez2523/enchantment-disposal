// Enters a phone/email signup through the exact same pipeline the website
// uses (geocode -> classify -> reserve a bin unit -> pending_verification),
// so phone customers get the same admin email, the same Approve/Reject
// handling, and the same "Cancel Service" link later as online signups.
//
// Usage:
//   npx tsx scripts/manualSignup.ts \
//     --name "Jane Doe" \
//     --email jane@example.com \
//     --phone "505-555-1234" \
//     --address "123 Main St, Santa Fe, NM 87501" \
//     --plan glorieta-64gal \
//     [--stripe-payment-intent pi_xxx] [--stripe-customer cus_xxx]
//
// Run `npm run signup:manual -- <args>` (note the extra `--`), or call tsx
// directly as above. The plan id must match one from src/data/serviceAreas.ts
// (e.g. glorieta-64gal, glorieta-96gal, surrounding-64gal, surrounding-96gal).
//
// Leave --stripe-payment-intent out for the normal phone/email signup flow —
// the signup fee is invoiced through QuickBooks, not Stripe, for these
// customers; Approve/Reject will just skip the Stripe step. Only pass it on
// the rare case payment was instead collected via a manual-capture Stripe
// Payment Link or Virtual Terminal charge, so Approve/Reject can capture or
// cancel it automatically.
//
// Most staff should use the /admin/new page in the dashboard instead of this
// script directly — same pipeline, no terminal required.

import { parseArgs } from "node:util";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
      plan: { type: "string" },
      "stripe-payment-intent": { type: "string" },
      "stripe-customer": { type: "string" },
    },
  });

  const missing = ["name", "email", "address", "plan"].filter(
    (key) => !values[key as keyof typeof values]
  );
  if (missing.length > 0) {
    console.error(`Missing required argument(s): ${missing.map((m) => `--${m}`).join(", ")}`);
    process.exit(1);
  }

  // Imported after config() so DATABASE_URL/MAPBOX_SECRET_TOKEN/etc. are
  // already loaded before these modules read process.env at call time.
  const { findPlan } = await import("../src/data/serviceAreas");
  const { matchAddressToServiceArea } = await import("../src/lib/signupIntake");
  const { createManualReservation, getReservationById, sweepExpiredReservations } = await import(
    "../src/lib/db/reservations"
  );
  const { sendPendingVerificationEmail } = await import("../src/lib/email/sendPendingVerificationEmail");

  const planId = values.plan!;
  const match = findPlan(planId);
  if (!match) {
    console.error(
      `Unknown plan id "${planId}". Must be one of the plan ids in src/data/serviceAreas.ts.`
    );
    process.exit(1);
  }
  const { area: selectedArea, plan } = match;

  await sweepExpiredReservations();

  const address = values.address!;
  const addressMatch = await matchAddressToServiceArea(address, selectedArea);

  if ("outside" in addressMatch) {
    console.error("That address is outside the current service area — not reserving a slot.");
    process.exit(1);
  }

  const created = await createManualReservation({
    serviceAreaId: addressMatch.serviceAreaId,
    binSize: plan.binSize,
    planId,
    customerName: values.name!,
    customerEmail: values.email!,
    customerPhone: values.phone,
    addressRaw: address,
    addressFormatted: addressMatch.formatted,
    lat: addressMatch.lat,
    lng: addressMatch.lng,
    verificationReason: addressMatch.verificationReason,
    stripePaymentIntentId: values["stripe-payment-intent"],
    stripeCustomerId: values["stripe-customer"],
  });

  if (!created) {
    console.error(`Out of stock for bin size "${plan.binSize}" — not reserving a slot.`);
    process.exit(1);
  }

  const reservation = await getReservationById(created.id);
  if (!reservation) {
    throw new Error("Reservation was created but could not be read back — this shouldn't happen.");
  }

  const emailResult = await sendPendingVerificationEmail(reservation);
  if (!emailResult.success) {
    console.error("Reservation created, but the admin notification email failed to send:", emailResult.error);
  }

  console.log(`Reservation ${reservation.id} created (status: ${reservation.status}, bin: ${reservation.binSize}).`);
  console.log("Admin notification email sent — approve or reject it the same way as an online signup.");
}

main().catch((err) => {
  console.error("manualSignup failed:", err);
  process.exit(1);
});
