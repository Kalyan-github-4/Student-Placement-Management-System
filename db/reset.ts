import { sql } from "drizzle-orm";
import { db } from "./index";

// Drops every table and enum so `drizzle-kit push` can recreate the schema from scratch.
// Development only: this deletes all data.
async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to reset in production.");
  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`create schema public`);
  console.log("Dropped and recreated the public schema.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
