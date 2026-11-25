import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

// Lazily initialized so importing this module (e.g. at Next.js build time,
// before DATABASE_URL is necessarily set) never throws — only an actual
// query does, same presence-check-at-use-time pattern as RESEND_API_KEY in
// src/app/contact/actions/sendInquiry.ts.
function getDb(): Db {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Database access is unavailable."
    );
  }

  cached = drizzle(neon(connectionString), { schema });
  return cached;
}

// Proxy so existing call sites can keep using `db.select()...` etc. without
// every file needing to call `getDb()` itself.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
