import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazily initialized, same reasoning as src/lib/db/client.ts — importing
// this module must not throw before STRIPE_SECRET_KEY is actually needed
// (e.g. at Next.js build time).
function getStripe(): Stripe {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY environment variable is not set. Payments are unavailable."
    );
  }

  cached = new Stripe(secretKey);
  return cached;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SITE_URL environment variable is not set.");
  }
  return url.replace(/\/$/, "");
}

// Every plan charges the same one-time signup fee, so there's one Price ID
// to manage rather than one per plan. Env-based (not hardcoded) because it
// differs between Stripe test and live mode — swap the env var when going
// live, no code change needed.
export function getSignupFeePriceId(): string {
  const priceId = process.env.STRIPE_SIGNUP_FEE_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_SIGNUP_FEE_PRICE_ID environment variable is not set.");
  }
  return priceId;
}
