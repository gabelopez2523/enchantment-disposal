// Client-safe service/plan catalog — names, labels, display prices, and
// Stripe Price IDs only. No geometry here (see src/data/geo/, server-only).
//
// NOTE: SIGNUP_FEE_PRICE_ID / recurringPriceId below are placeholders.
// Create the real one-time (signup fee) and recurring (monthly) Price
// objects in the Stripe dashboard and swap these in before launch.

// Every plan charges the same one-time signup fee — set it here once, not
// per plan, so there's only one place to paste the real Price ID (and one
// less chance of a typo on any single plan).
export const SIGNUP_FEE_PRICE_ID = "price_1UbQkrReJeb6RwexWy7dS7Lx";

export type BinSize = "64gal" | "96gal";

export interface ServicePlan {
  id: string;
  label: string;
  monthlyPrice: string; // display only, e.g. "$45/mo"
  recurringPriceId: string; // Stripe Price ID, recurring — not yet wired into Checkout; recurring billing is set up manually for now
  // Which physical bin pool this plan draws from — see src/data/binInventory.ts.
  // The real capacity constraint is the shared bin stock, not a per-area cap.
  binSize: BinSize;
}

export interface ServiceAreaSummary {
  id: string; // slug — must match src/data/geo/*.geo.json and the seeded service_areas row
  name: string;
  pickup: string;
  plans: ServicePlan[];
}

export const serviceAreas: ServiceAreaSummary[] = [
  {
    id: "glorieta",
    name: "Glorieta, Santa Fe County",
    pickup: "Trash weekly, recycling bi-weekly — pickup day is Friday",
    plans: [
      {
        id: "glorieta-64gal",
        label: "64 Gallon Trash Bin",
        monthlyPrice: "$45/mo",
        recurringPriceId: "price_REPLACE_glorieta_64gal",
        binSize: "64gal",
      },
      {
        id: "glorieta-96gal",
        label: "96 Gallon Trash Bin",
        monthlyPrice: "$65/mo",
        recurringPriceId: "price_REPLACE_glorieta_96gal",
        binSize: "96gal",
      },
    ],
  },
  {
    id: "surrounding",
    name: "Santa Fe County (surrounding areas)",
    pickup: "Trash weekly, recycling bi-weekly — pickup day varies by address",
    plans: [
      {
        id: "surrounding-64gal",
        label: "64 Gallon Trash Bin",
        monthlyPrice: "$35/mo",
        recurringPriceId: "price_REPLACE_surrounding_64gal",
        binSize: "64gal",
      },
      {
        id: "surrounding-96gal",
        label: "96 Gallon Trash Bin",
        monthlyPrice: "$40/mo",
        recurringPriceId: "price_REPLACE_surrounding_96gal",
        binSize: "96gal",
      },
    ],
  },
];

export function findPlan(
  planId: string
): { area: ServiceAreaSummary; plan: ServicePlan } | null {
  for (const area of serviceAreas) {
    const plan = area.plans.find((p) => p.id === planId);
    if (plan) return { area, plan };
  }
  return null;
}
