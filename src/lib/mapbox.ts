// Server-only Mapbox geocoding. MAPBOX_SECRET_TOKEN must never reach the
// client (no NEXT_PUBLIC_ prefix) — this mirrors how RESEND_API_KEY is
// handled in src/app/contact/actions/sendInquiry.ts. Plain fetch against
// Mapbox's v5 Geocoding API; no SDK dependency needed for a single endpoint.

const LOW_CONFIDENCE_THRESHOLD = 0.8; // Mapbox "relevance" score, 0-1

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
  confident: boolean;
}

export type GeocodeOutcome =
  | { ok: true; result: GeocodeResult }
  | { ok: false; reason: "config_error" | "geocode_failed" };

export async function geocodeAddress(address: string): Promise<GeocodeOutcome> {
  const token = process.env.MAPBOX_SECRET_TOKEN;

  if (!token) {
    console.error("MAPBOX_SECRET_TOKEN environment variable is not set");
    return { ok: false, reason: "config_error" };
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${token}&limit=1&country=us`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error("Mapbox geocoding request failed:", res.status, await res.text());
      return { ok: false, reason: "geocode_failed" };
    }

    const data = await res.json();
    const feature = data?.features?.[0];

    if (!feature || !Array.isArray(feature.center) || feature.center.length !== 2) {
      return { ok: false, reason: "geocode_failed" };
    }

    const [lng, lat] = feature.center as [number, number];
    const relevance: number = typeof feature.relevance === "number" ? feature.relevance : 0;

    return {
      ok: true,
      result: {
        lat,
        lng,
        formatted: feature.place_name ?? address,
        confident: relevance >= LOW_CONFIDENCE_THRESHOLD,
      },
    };
  } catch (err) {
    console.error("Unexpected error geocoding address:", err);
    return { ok: false, reason: "geocode_failed" };
  }
}
