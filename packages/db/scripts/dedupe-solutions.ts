// One-off cleanup: remove duplicate solutions (same user, same transcript),
// keeping the earliest copy, so the unique index can be created.
// Run with: bun run scripts/dedupe-solutions.ts
import { neon } from "@neondatabase/serverless"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")
const sql = neon(connectionString)

const dupes = await sql`
  SELECT user_id, md5(raw_transcript) AS hash, count(*) AS n
  FROM solutions
  GROUP BY user_id, md5(raw_transcript)
  HAVING count(*) > 1
`
console.log(`Duplicate groups: ${dupes.length}`)

const deleted = await sql`
  DELETE FROM solutions a
  USING solutions b
  WHERE a.user_id = b.user_id
    AND md5(a.raw_transcript) = md5(b.raw_transcript)
    AND (a.created_at > b.created_at
      OR (a.created_at = b.created_at AND a.id > b.id))
  RETURNING a.id
`
console.log(`Deleted ${deleted.length} duplicate solution(s).`)
