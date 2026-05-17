import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleClient | null = null;

function getDb(): DrizzleClient {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Neon connection string).",
    );
  }
  const sql = neon(url);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as DrizzleClient, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export { schema };
