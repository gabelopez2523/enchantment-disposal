// Physical bin stock — the real capacity constraint on signups. Shared
// across both service areas: whichever area signs up first uses up the
// pool. Seeded into the `bin_inventory` table via `npm run db:seed`
// (scripts/seedBinInventory.ts) — bump a count here and re-seed to update it.
import type { BinSize } from "./serviceAreas";

export interface BinInventoryItem {
  id: BinSize;
  label: string;
  totalUnits: number;
}

export const binInventory: BinInventoryItem[] = [
  { id: "64gal", label: "64 Gallon Trash Bin", totalUnits: 30 },
  { id: "96gal", label: "96 Gallon Trash Bin", totalUnits: 4 },
];
