import { db, schema } from "@workspace/db"
import { getRedis } from "@workspace/redis"
import { sql } from "drizzle-orm"

import type { SourceModel } from "@/lib/solution-schema"

export type SearchResult = {
  id: string
  title: string
  preview: string
  sourceModel: SourceModel
  createdAt: string
  tags: string[]
  rank: number
}

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24 hours
const MAX_RESULTS = 20

/**
 * Turn free-text into a safe `to_tsquery` string: keep alphanumerics, prefix-
 * match each term (`:*`), AND them together. "cors expr" -> "cors:* & expr:*".
 */
function toTsQuery(raw: string): string {
  const terms = raw.toLowerCase().match(/[a-z0-9]+/g) ?? []
  return terms.map((term) => `${term}:*`).join(" & ")
}

async function cacheGet(key: string): Promise<SearchResult[] | null> {
  try {
    return (await getRedis().get<SearchResult[]>(key)) ?? null
  } catch {
    // Redis not configured / unreachable — degrade gracefully to the DB.
    return null
  }
}

async function cacheSet(key: string, value: SearchResult[]): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: CACHE_TTL_SECONDS })
  } catch {
    // Ignore cache write failures.
  }
}

export async function searchSolutions(query: string): Promise<SearchResult[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const tsQueryString = toTsQuery(normalized)
  if (!tsQueryString) return []

  // 1. Cache lookup.
  const cacheKey = `search:${normalized}`
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  // 2. Cache miss -> query Neon with ts_rank weighting.
  const tsQuery = sql`to_tsquery('english', ${tsQueryString})`

  const rows = await db
    .select({
      id: schema.solutions.id,
      title: schema.solutions.questionTitle,
      preview: sql<string>`left(${schema.solutions.answerBody}, 200)`,
      sourceModel: schema.solutions.sourceModel,
      createdAt: schema.solutions.createdAt,
      tags: sql<
        string[]
      >`coalesce((select array_agg(t.name) from solution_tags st join tags t on t.id = st.tag_id where st.solution_id = ${schema.solutions.id}), '{}')`,
      rank: sql<number>`ts_rank(${schema.solutions.searchVector}, ${tsQuery})`,
    })
    .from(schema.solutions)
    .where(sql`${schema.solutions.searchVector} @@ ${tsQuery}`)
    .orderBy(sql`ts_rank(${schema.solutions.searchVector}, ${tsQuery}) desc`)
    .limit(MAX_RESULTS)

  const results: SearchResult[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    preview: row.preview,
    sourceModel: row.sourceModel,
    createdAt: row.createdAt.toISOString(),
    tags: row.tags ?? [],
    rank: Number(row.rank),
  }))

  // 3. Populate cache for 24h, then return.
  await cacheSet(cacheKey, results)
  return results
}
