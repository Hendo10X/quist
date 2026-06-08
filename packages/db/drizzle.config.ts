import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// drizzle-kit doesn't auto-load .env, and the env lives at the monorepo root,
// so load it explicitly relative to this file (works from any cwd).
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") })

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
