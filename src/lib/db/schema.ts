import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// The real capacity constraint: physical bin stock, shared across both
// service areas (e.g. "64gal" -> 30 total, "96gal" -> 8 total). Seeded from
// src/data/binInventory.ts via scripts/seedBinInventory.ts — not hand-entered.
export const binInventory = pgTable("bin_inventory", {
  id: text("id").primaryKey(), // bin size slug, e.g. "64gal"
  label: text("label").notNull(),
  totalUnits: integer("total_units").notNull(),
  activeCount: integer("active_count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// status: "pending_payment" | "pending_verification" | "active" | "expired" | "rejected" | "canceled"
// verificationReason: "buffer_zone" | "low_confidence" | "geocode_failed" | "area_mismatch" | "awaiting_approval" | "admin_override" | null
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey(),
  // "online" (via /signup + Stripe Checkout) or "phone" (manually entered
  // via scripts/manualSignup.ts for a phone/email signup) — shown in the
  // admin email so it's clear which pipeline a signup came through.
  source: text("source").notNull().default("online"),
  // Informational only (which service area the address matched, for admin
  // review/pricing) — capacity is enforced against binInventory below, not
  // per area, so this is plain text with no FK to a capacity table.
  serviceAreaId: text("service_area_id").notNull(),
  // Which physical bin pool this reservation holds a unit from — the actual
  // capacity constraint. Must match a row in binInventory.
  binSize: text("bin_size").notNull(),
  status: text("status").notNull(),
  verificationReason: text("verification_reason"),
  planId: text("plan_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  addressRaw: text("address_raw").notNull(),
  addressFormatted: text("address_formatted"),
  lat: numeric("lat"),
  lng: numeric("lng"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  // Unused while this feature only collects the one-time signup fee —
  // kept for when recurring billing moves into Stripe Checkout later.
  stripeSubscriptionId: text("stripe_subscription_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Lead capture only — no capacity held, no address verification. A customer
// lands here when their chosen bin size is out of stock; an admin manually
// reaches out and runs them through the normal signup flow once a unit
// frees up (see sendSlotAvailableEmail.ts, triggered from releaseHeldSlot
// in reservations.ts).
// status: "waiting" | "resolved"
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey(),
  status: text("status").notNull().default("waiting"),
  serviceAreaId: text("service_area_id").notNull(),
  binSize: text("bin_size").notNull(),
  planId: text("plan_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  addressRaw: text("address_raw").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Backs a Postgres-based rate limiter (see src/lib/db/rateLimit.ts) for the
// public signup/waitlist forms — no new infra (Redis, etc.) needed since
// everything else in this app already goes through this same database.
// key is e.g. "signup:<ip>" or "waitlist:<ip>"; one row per attempt, counted
// within a trailing window and pruned once past it.
export const rateLimitAttempts = pgTable(
  "rate_limit_attempts",
  {
    id: uuid("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("rate_limit_key_created_idx").on(table.key, table.createdAt)]
);
