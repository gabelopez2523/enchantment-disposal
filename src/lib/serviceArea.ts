import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import { point } from "@turf/helpers";
import { serviceAreaGeo } from "@/data/geo";

export type AreaMatch =
  | { classification: "inside"; areaId: string }
  | { classification: "buffer_zone"; areaId: string }
  | { classification: "outside" };

/**
 * Checks a geocoded point against every configured service area's polygon.
 * A point inside the raw polygon wins outright. Otherwise, if it falls
 * inside any area's buffered polygon (to absorb geocoding imprecision near
 * a real boundary), that's a "buffer_zone" match — routed to manual
 * verification, never auto-approved or auto-rejected. Only a point outside
 * every area's buffer is "outside" (auto-rejected before checkout starts).
 */
export function classifyAddress(lat: number, lng: number): AreaMatch {
  const pt = point([lng, lat]);

  for (const area of serviceAreaGeo) {
    if (booleanPointInPolygon(pt, area.polygon)) {
      return { classification: "inside", areaId: area.id };
    }
  }

  for (const area of serviceAreaGeo) {
    const buffered = buffer(area.polygon, area.bufferMiles, { units: "miles" });
    if (buffered && booleanPointInPolygon(pt, buffered)) {
      return { classification: "buffer_zone", areaId: area.id };
    }
  }

  return { classification: "outside" };
}
