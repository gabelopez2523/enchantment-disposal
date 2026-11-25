// One-off/idempotent seed script: pushes the developer-maintained bin
// inventory list (src/data/binInventory.ts) into the `bin_inventory` table.
// Run with `npm run db:seed` after changing a bin count.
//
// Does not touch `active_count` on existing rows — only sets it on first
// insert — so re-running this after launch can't accidentally wipe out the
// live reserved-unit count.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { binInventory } from "../src/data/binInventory";

async function main() {
  // This script runs standalone (not through Next.js), so .env.local isn't
  // loaded automatically the way it is for `next dev`/`next build`.
  config({ path: ".env.local" });

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const db = drizzle(neon(connectionString), { schema });

  for (const bin of binInventory) {
    await db
      .insert(schema.binInventory)
      .values({
        id: bin.id,
        label: bin.label,
        totalUnits: bin.totalUnits,
        activeCount: 0,
      })
      .onConflictDoUpdate({
        target: schema.binInventory.id,
        set: {
          label: bin.label,
          totalUnits: bin.totalUnits,
          updatedAt: sql`now()`,
        },
      });

    console.log(`Seeded bin inventory "${bin.id}" (totalUnits: ${bin.totalUnits}).`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
