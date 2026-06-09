import { Hono } from "hono"

import { searchSolutions } from "@/lib/search"

// Hono API mounted under /api. Full-text search lives here; more routes can be
// added as the backend grows (and later lifted into a standalone Hono service).
export const api = new Hono().basePath("/api")

api.get("/search", async (c) => {
  const query = c.req.query("q") ?? ""
  const results = await searchSolutions(query)
  return c.json({ query, results })
})
