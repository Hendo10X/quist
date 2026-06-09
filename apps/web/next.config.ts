import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"
import type { NextConfig } from "next"

// The monorepo keeps a single .env at the repo root; Next only auto-loads from
// apps/web, so load the root file here (resolved relative to this config).
config({
  path: resolve(fileURLToPath(new URL(".", import.meta.url)), "../../.env"),
})

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db", "@workspace/redis"],
}

export default nextConfig
