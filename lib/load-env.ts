import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

export function loadEnvFiles() {
  for (const file of [".env", ".env.local", ".env.development.local"]) {
    const path = resolve(file);
    if (existsSync(path)) config({ path, override: true });
  }
}
