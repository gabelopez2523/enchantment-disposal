import { geocodeAddress } from "@/lib/mapbox";
import { classifyAddress } from "@/lib/serviceArea";
import type { ServiceAreaSummary } from "@/data/serviceAreas";
import type { VerificationReason } from "@/lib/db/reservations";

export interface AddressMatch {
  serviceAreaId: string;
  verificationReason: VerificationReason;
  lat?: number;
  lng?: number;
  formatted?: string;
}

export type AddressMatchResult =
  | AddressMatch
  | { outside: true; lat?: number; lng?: number; formatted?: string };

/**
 * Shared by the online checkout action and the phone/email manual-signup
 * script, so both pipelines decide "which area, and does this need extra
 * scrutiny" with the exact same logic — kept in one place to avoid the two
 * copies drifting apart.
 *
 * Every signup still needs client approval regardless of outcome here
 * (see VerificationReason's "awaiting_approval") — this only decides which
 * reason the admin email shows, and whether the address is serviceable at
 * all ("outside" — the one case that's rejected outright, before any
 * reservation or charge).
 */
export async function matchAddressToServiceArea(
  address: string,
  selectedArea: ServiceAreaSummary
): Promise<AddressMatchResult> {
  const geocode = await geocodeAddress(address);

  if (!geocode.ok) {
    // No geo data to go on — fall back to the customer's own plan
    // selection and flag for human review.
    return { serviceAreaId: selectedArea.id, verificationReason: "geocode_failed" };
  }

  const { lat, lng, formatted, confident } = geocode.result;
  const area = classifyAddress(lat, lng);

  if (area.classification === "outside") {
    // The geocode itself succeeded — keep the coordinates/formatted address
    // around in case an admin overrides this and services it anyway.
    return { outside: true, lat, lng, formatted };
  }

  // Capacity is always reserved against the area the address actually
  // matched, not necessarily the plan the customer (or phone rep) picked.
  const serviceAreaId = area.areaId;
  const areaMismatch = area.areaId !== selectedArea.id;

  let verificationReason: VerificationReason;
  if (areaMismatch) {
    verificationReason = "area_mismatch";
  } else if (area.classification === "buffer_zone") {
    verificationReason = "buffer_zone";
  } else if (!confident) {
    verificationReason = "low_confidence";
  } else {
    verificationReason = "awaiting_approval"; // confident, in-polygon match — still needs sign-off
  }

  return { serviceAreaId, verificationReason, lat, lng, formatted };
}
