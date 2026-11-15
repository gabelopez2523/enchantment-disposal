// Server-only service-area geometry config. Never import this from a
// client component — the polygons are large and have no reason to ship to
// the browser. Imported only by src/lib/serviceArea.ts.
//
// No capacity here — the real capacity constraint is physical bin stock
// (see src/data/binInventory.ts), shared across areas, not an area-level
// cap. This file is purely about geography: which polygon is which area,
// and how much buffer absorbs geocoding imprecision near its edge.

import glorietaGeo from "./glorieta.geo.json";
import surroundingGeo from "./surrounding.geo.json";
import type { Feature, MultiPolygon, Polygon } from "geojson";

export interface ServiceAreaGeo {
  id: string;
  bufferMiles: number;
  // Each area is a MultiPolygon — the real boundaries are several separate
  // pieces (e.g. Glorieta is 4 route polygons, surrounding areas are 10),
  // not one single shape.
  polygon: Feature<Polygon | MultiPolygon>;
}

export const serviceAreaGeo: ServiceAreaGeo[] = [
  {
    id: "glorieta",
    bufferMiles: 0.25,
    polygon: glorietaGeo as Feature<Polygon | MultiPolygon>,
  },
  {
    id: "surrounding",
    bufferMiles: 0.25,
    polygon: surroundingGeo as Feature<Polygon | MultiPolygon>,
  },
];

export function getServiceAreaGeo(id: string): ServiceAreaGeo | undefined {
  return serviceAreaGeo.find((area) => area.id === id);
}
