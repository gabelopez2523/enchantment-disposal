import { randomUUID } from "crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { waitlist } from "./schema";

interface NewWaitlistEntryInput {
  serviceAreaId: string;
  binSize: string;
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressRaw: string;
}

/**
 * Pure lead capture — no capacity check, no geocoding, just a record of
 * interest. Returns the full row so the caller can email it straight to
 * the admin without a second query.
 */
export async function addToWaitlist(
  input: NewWaitlistEntryInput
): Promise<typeof waitlist.$inferSelect> {
  const id = randomUUID();

  const [row] = await db
    .insert(waitlist)
    .values({
      id,
      status: "waiting",
      serviceAreaId: input.serviceAreaId,
      binSize: input.binSize,
      planId: input.planId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      addressRaw: input.addressRaw,
    })
    .returning();

  return row;
}

/** Everyone currently waiting for a given bin size, oldest first (FIFO). */
export async function getWaitingForBinSize(
  binSize: string
): Promise<(typeof waitlist.$inferSelect)[]> {
  return db
    .select()
    .from(waitlist)
    .where(and(eq(waitlist.binSize, binSize), eq(waitlist.status, "waiting")))
    .orderBy(asc(waitlist.createdAt));
}

export interface ListWaitlistFilter {
  status?: string;
  binSize?: string;
  limit?: number;
  offset?: number;
}

/** Powers the admin dashboard's waitlist page. */
export async function listWaitlist(filter: ListWaitlistFilter = {}) {
  const { status, binSize, limit = 50, offset = 0 } = filter;

  const conditions = [];
  if (status) conditions.push(eq(waitlist.status, status));
  if (binSize) conditions.push(eq(waitlist.binSize, binSize));

  return db
    .select()
    .from(waitlist)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(waitlist.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Admin clicked "Resolve" once they've followed up with this lead. */
export async function resolveWaitlistEntry(id: string): Promise<boolean> {
  const updated = await db
    .update(waitlist)
    .set({ status: "resolved", updatedAt: new Date() })
    .where(and(eq(waitlist.id, id), eq(waitlist.status, "waiting")))
    .returning({ id: waitlist.id });

  return updated.length > 0;
}
