import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { getSql } from "../lib/neon-sql";

for (const file of [".env", ".env.local", ".env.development.local"]) {
  const path = resolve(file);
  if (existsSync(path)) config({ path, override: true });
}

async function main() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT)`;
  console.log("✓ comments table ready");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
