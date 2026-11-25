import { randomUUID } from "crypto";
import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "./client";
import { binInventory, reservations } from "./schema";
import { getWaitingForBinSize } from "./waitlist";
import { sendSlotAvailableEmail } from "@/lib/email/sendWaitlistEmails";

const HOLD_MINUTES = 30;

export type ReservationStatus =
  | "pending_payment"
  | "pending_verification"
  | "active"
  | "expired"
  | "rejected"
  | "canceled";

export type VerificationReason =
  | "buffer_zone"
  | "low_confidence"
  | "geocode_failed"
  // Address geocoded confidently, but into a different service area than
  // the plan the customer selected (wrong dropdown pick, or a street that
  // straddles two areas) — recorded for admin review; doesn't affect which
  // bin pool the reservation draws from (that's the plan's bin size).
  | "area_mismatch"
  // Every signup now needs client sign-off regardless of address
  // confidence — this is the "nothing's actually wrong" default reason.
  | "awaiting_approval"
  // Address geocoded entirely outside every service area's buffer — an
  // admin explicitly chose to service it anyway via the New Signup form's
  // override, rather than the system matching it to any area.
  | "admin_override";

interface NewReservationInput {
  serviceAreaId: string;
  binSize: string;
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressRaw: string;
  addressFormatted?: string;
  lat?: number;
  lng?: number;
  /** Determined at checkout-creation time from the geocode/polygon check —
   *  every signup now routes to pending_verification regardless of value;
   *  this just tells the admin email why (routine sign-off vs a real
   *  address concern). */
  verificationReason: VerificationReason;
}

/**
 * Lazily releases any pending_payment hold whose 30-minute window has
 * passed. Called at the top of every new checkout attempt so an abandoned
 * checkout frees its slot without needing a cron job. Safe to call
 * concurrently/redundantly — each release is status-guarded.
 */
export async function sweepExpiredReservations(): Promise<void> {
  const stale = await db
    .select({ id: reservations.id, binSize: reservations.binSize })
    .from(reservations)
    .where(
      and(
        eq(reservations.status, "pending_payment"),
        lt(reservations.expiresAt, sql`now()`)
      )
    );

  for (const row of stale) {
    await releaseHeldSlot(row.id, row.binSize, "expired", "pending_payment");
  }
}

/**
 * Atomically reserves one unit of physical bin stock and inserts a
 * `pending_payment` reservation row for an online /signup checkout.
 * Returns null if that bin size is out of stock — callers must not create
 * a Stripe Checkout Session in that case.
 *
 * Race-safe: the capacity check and increment happen in a single UPDATE,
 * so two concurrent calls can never both succeed past totalUnits.
 */
export async function reserveSlot(
  input: NewReservationInput
): Promise<{ id: string } | null> {
  const incremented = await incrementBinInventory(input.binSize);
  if (!incremented) return null; // out of stock for this bin size

  const id = randomUUID();
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

  await db.insert(reservations).values({
    id,
    source: "online",
    serviceAreaId: input.serviceAreaId,
    binSize: input.binSize,
    status: "pending_payment",
    planId: input.planId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    addressRaw: input.addressRaw,
    addressFormatted: input.addressFormatted,
    lat: input.lat?.toString(),
    lng: input.lng?.toString(),
    verificationReason: input.verificationReason,
    expiresAt,
  });

  return { id };
}

/**
 * Same capacity reservation, for a phone/email signup entered manually via
 * scripts/manualSignup.ts — skips straight to pending_verification since
 * there's no Stripe Checkout Session to wait on (payment, if collected via
 * Stripe at all, happens through a separately-created Payment Link or
 * Virtual Terminal charge; pass its PaymentIntent id so Approve/Reject can
 * still capture/cancel it the same way as an online signup).
 */
export async function createManualReservation(
  input: NewReservationInput & { stripePaymentIntentId?: string; stripeCustomerId?: string }
): Promise<{ id: string } | null> {
  const incremented = await incrementBinInventory(input.binSize);
  if (!incremented) return null; // out of stock for this bin size

  const id = randomUUID();

  await db.insert(reservations).values({
    id,
    source: "phone/email",
    serviceAreaId: input.serviceAreaId,
    binSize: input.binSize,
    status: "pending_verification",
    planId: input.planId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    addressRaw: input.addressRaw,
    addressFormatted: input.addressFormatted,
    lat: input.lat?.toString(),
    lng: input.lng?.toString(),
    verificationReason: input.verificationReason,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeCustomerId: input.stripeCustomerId,
  });

  return { id };
}

async function incrementBinInventory(binSize: string): Promise<boolean> {
  const incremented = await db
    .update(binInventory)
    .set({ activeCount: sql`${binInventory.activeCount} + 1`, updatedAt: sql`now()` })
    .where(
      and(
        eq(binInventory.id, binSize),
        lt(binInventory.activeCount, binInventory.totalUnits)
      )
    )
    .returning({ activeCount: binInventory.activeCount });

  return incremented.length > 0;
}

export async function attachCheckoutSession(
  reservationId: string,
  stripeCheckoutSessionId: string
): Promise<void> {
  await db
    .update(reservations)
    .set({ stripeCheckoutSessionId, updatedAt: sql`now()` })
    .where(eq(reservations.id, reservationId));
}

export async function getReservationBySessionId(sessionId: string) {
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getReservationById(id: string) {
  const rows = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface ListReservationsFilter {
  status?: ReservationStatus;
  binSize?: string;
  serviceAreaId?: string;
  source?: string;
  /** Matches against customer name, email, or address (case-insensitive). */
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Powers the admin dashboard's reservation list — the one place in this
 * file that lists/searches rather than looking up a single known id.
 */
export async function listReservations(filter: ListReservationsFilter = {}) {
  const { status, binSize, serviceAreaId, source, search, limit = 50, offset = 0 } = filter;

  const conditions = [];
  if (status) conditions.push(eq(reservations.status, status));
  if (binSize) conditions.push(eq(reservations.binSize, binSize));
  if (serviceAreaId) conditions.push(eq(reservations.serviceAreaId, serviceAreaId));
  if (source) conditions.push(eq(reservations.source, source));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(reservations.customerName, pattern),
        ilike(reservations.customerEmail, pattern),
        ilike(reservations.addressRaw, pattern)
      )
    );
  }

  return db
    .select()
    .from(reservations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reservations.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Read-only summary for the admin dashboard's inventory page. */
export async function getBinInventorySummary() {
  return db.select().from(binInventory).orderBy(binInventory.id);
}

/**
 * checkout.session.completed — resolves a pending_payment reservation to
 * pending_verification now that the card has been authorized (capture_method:
 * "manual" — nothing is actually charged yet). Every signup lands here
 * regardless of address confidence; the admin's Approve action is what
 * captures the charge. Guarded: a no-op if the reservation isn't still
 * pending_payment (safe against Stripe webhook retries).
 */
export async function finalizeReservationPayment(
  sessionId: string,
  stripe: { customerId: string; paymentIntentId: string }
): Promise<(typeof reservations.$inferSelect) | null> {
  const updated = await db
    .update(reservations)
    .set({
      status: "pending_verification",
      stripeCustomerId: stripe.customerId,
      stripePaymentIntentId: stripe.paymentIntentId,
      updatedAt: sql`now()`,
    })
    .where(and(eq(reservations.stripeCheckoutSessionId, sessionId), eq(reservations.status, "pending_payment")))
    .returning();

  return updated[0] ?? null;
}

/**
 * checkout.session.expired — releases a held slot for an abandoned
 * checkout. Guarded/idempotent against the lazy sweep already handling it.
 */
export async function expireReservationBySessionId(sessionId: string): Promise<void> {
  const rows = await db
    .select({ id: reservations.id, binSize: reservations.binSize })
    .from(reservations)
    .where(and(eq(reservations.stripeCheckoutSessionId, sessionId), eq(reservations.status, "pending_payment")))
    .limit(1);

  const row = rows[0];
  if (!row) return; // already resolved (paid, or swept as expired) — no-op

  await releaseHeldSlot(row.id, row.binSize, "expired", "pending_payment");
}

/**
 * Releases a reservation that never made it to Stripe at all — e.g.
 * `reserveSlot` succeeded (bin unit held, row inserted) but the immediately
 * following `stripe.checkout.sessions.create` call then failed, so there's
 * no checkout session id to key off of (expireReservationBySessionId can't
 * find it) and no webhook will ever arrive for it either. Without this,
 * such a reservation just sits in pending_payment holding a unit until the
 * next *unrelated* checkout attempt happens to sweep expired holds —
 * called directly, by id, right at the failure site instead so a failed
 * attempt never leaks capacity even briefly.
 */
export async function releaseUncommittedReservation(reservationId: string): Promise<void> {
  const rows = await db
    .select({ id: reservations.id, binSize: reservations.binSize })
    .from(reservations)
    .where(and(eq(reservations.id, reservationId), eq(reservations.status, "pending_payment")))
    .limit(1);

  const row = rows[0];
  if (!row) return; // already resolved somehow — no-op

  await releaseHeldSlot(row.id, row.binSize, "expired", "pending_payment");
}

/**
 * payment_intent.canceled — Stripe auto-cancels an uncaptured authorization
 * after its hold window passes (about 7 days) if nobody captures it first.
 * If the admin never acted on this reservation, release its slot rather
 * than leaving it stuck in pending_verification forever.
 */
export async function expireReservationByPaymentIntentId(paymentIntentId: string): Promise<void> {
  const rows = await db
    .select({ id: reservations.id, binSize: reservations.binSize })
    .from(reservations)
    .where(
      and(
        eq(reservations.stripePaymentIntentId, paymentIntentId),
        eq(reservations.status, "pending_verification")
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return; // already resolved — no-op

  await releaseHeldSlot(row.id, row.binSize, "expired", "pending_verification");
}

/**
 * Admin clicked the "Cancel service" link (sent on every active
 * confirmation) once a customer's service actually ends. Since this phase
 * only collects the one-time signup fee — recurring billing/cancellation
 * happens manually, outside Stripe — there's no subscription webhook to
 * react to, so this is the only way a held slot gets released once active.
 * Guarded: a no-op if the reservation isn't still active.
 */
export async function cancelActiveReservation(
  reservationId: string
): Promise<{ ok: boolean; reservation?: typeof reservations.$inferSelect }> {
  const before = await getReservationById(reservationId);
  if (!before || before.status !== "active") return { ok: false };

  await releaseHeldSlot(reservationId, before.binSize, "canceled", "active");
  return { ok: true, reservation: { ...before, status: "canceled" } };
}

/**
 * Admin clicked Approve/Reject on a pending_verification reservation.
 * Approve keeps the slot held (it already counted) — the caller captures
 * the authorized charge in Stripe. Reject releases the slot — the caller
 * cancels the (never-captured) authorization in Stripe, so no money ever
 * actually moves.
 */
export async function resolveVerification(
  reservationId: string,
  action: "approve" | "reject"
): Promise<{ ok: boolean; reservation?: typeof reservations.$inferSelect }> {
  const before = await getReservationById(reservationId);
  if (!before || before.status !== "pending_verification") return { ok: false };

  if (action === "approve") {
    const updated = await db
      .update(reservations)
      .set({ status: "active", updatedAt: sql`now()` })
      .where(and(eq(reservations.id, reservationId), eq(reservations.status, "pending_verification")))
      .returning();

    return { ok: updated.length > 0, reservation: updated[0] };
  }

  await releaseHeldSlot(reservationId, before.binSize, "rejected", "pending_verification");
  return { ok: true, reservation: { ...before, status: "rejected" } };
}

/** Status-guarded transition + matching capacity decrement, as one unit. */
async function releaseHeldSlot(
  reservationId: string,
  binSize: string,
  newStatus: ReservationStatus,
  fromStatus: ReservationStatus
): Promise<void> {
  const updated = await db
    .update(reservations)
    .set({ status: newStatus, updatedAt: sql`now()` })
    .where(and(eq(reservations.id, reservationId), eq(reservations.status, fromStatus)))
    .returning({ id: reservations.id });

  if (updated.length === 0) return; // already transitioned by a concurrent caller

  await db
    .update(binInventory)
    .set({ activeCount: sql`${binInventory.activeCount} - 1`, updatedAt: sql`now()` })
    .where(eq(binInventory.id, binSize));

  // Single chokepoint for every way a unit can free up (cancel, reject,
  // expire) — check the waitlist here rather than duplicating this check
  // across every caller. Best-effort: a failed notification shouldn't
  // undo the release that already succeeded above.
  try {
    const waiting = await getWaitingForBinSize(binSize);
    if (waiting.length > 0) {
      const result = await sendSlotAvailableEmail(binSize, waiting);
      if (!result.success) {
        console.error("Failed to send slot-available email for bin size", binSize, result.error);
      }
    }
  } catch (err) {
    console.error("Error checking/notifying waitlist for bin size", binSize, err);
  }
}
