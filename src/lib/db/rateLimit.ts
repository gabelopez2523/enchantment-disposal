import { randomUUID } from "crypto";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "./client";
import { rateLimitAttempts } from "./schema";

/**
 * Simple Postgres-backed fixed-window rate limiter — no new infra (Redis,
 * etc.) needed since every other write in this app already goes through
 * this database. Returns false once `key` has hit `maxAttempts` within the
 * trailing `windowMinutes`; otherwise records this attempt and returns true.
 *
 * Also opportunistically prunes attempts past the window for this key, so
 * the table doesn't grow unbounded for repeat callers.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitAttempts)
    .where(and(eq(rateLimitAttempts.key, key), gte(rateLimitAttempts.createdAt, windowStart)));

  if (Number(count) >= maxAttempts) {
    return false;
  }

  await db.insert(rateLimitAttempts).values({ id: randomUUID(), key });
  await db.delete(rateLimitAttempts).where(and(eq(rateLimitAttempts.key, key), lt(rateLimitAttempts.createdAt, windowStart)));

  return true;
}
