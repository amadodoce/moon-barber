import { loadEnvFiles } from "../lib/load-env";
import { getSql } from "../lib/neon-sql";

loadEnvFiles();

async function main() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS comments (comment TEXT)`;
  console.log("✓ comments table ready");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
