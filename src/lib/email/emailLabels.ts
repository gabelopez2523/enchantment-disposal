// Email-only display overrides. The underlying ids ("surrounding",
// "surrounding-64gal", etc.) stay exactly as-is everywhere else — the /signup
// form, the database, the GeoJSON filenames, and the Stripe price lookups
// all key off them, so they must not change. These overrides only affect
// how the admin notification emails (sendActiveSignupEmail,
// sendPendingVerificationEmail) read; nothing else imports this file.
const AREA_LABEL_OVERRIDES: Record<string, string> = {
  surrounding: "Santa Fe County (Santa Fe Neighborhoods)",
};

const PLAN_LABEL_OVERRIDES: Record<string, string> = {
  "surrounding-64gal": "Santa Fe Neighborhood-64gal",
  "surrounding-96gal": "Santa Fe Neighborhood-96gal",
};

export function emailAreaLabel(areaId: string, fallback: string): string {
  return AREA_LABEL_OVERRIDES[areaId] ?? fallback;
}

export function emailPlanLabel(planId: string): string {
  return PLAN_LABEL_OVERRIDES[planId] ?? planId;
}
