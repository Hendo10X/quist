-- Custom migration: weighted, precomputed full-text search on `solutions`.
-- `bun run db:push` applies the equivalent from the Drizzle schema; this file
-- documents the exact SQL and can be run by hand in the Neon SQL editor if a
-- generated column ever needs to be (re)created manually.

ALTER TABLE "solutions"
  ADD COLUMN IF NOT EXISTS "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("question_title", '')), 'A')
    ||
    setweight(
      to_tsvector(
        'english',
        coalesce("question_body", '') || ' ' || coalesce("answer_body", '')
      ),
      'B'
    )
  ) STORED;

-- GIN index makes `search_vector @@ to_tsquery(...)` fast.
CREATE INDEX IF NOT EXISTS "solutions_search_idx"
  ON "solutions" USING gin ("search_vector");
