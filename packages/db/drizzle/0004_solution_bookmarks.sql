-- Custom migration: private "save for later" bookmarks.
-- `bun run db:push` applies the equivalent from the Drizzle schema; this file
-- documents the exact SQL and can be run by hand in the Neon SQL editor.

CREATE TABLE IF NOT EXISTS "solution_bookmarks" (
  "solution_id" uuid NOT NULL REFERENCES "solutions"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "solution_bookmarks_solution_id_user_id_pk"
    PRIMARY KEY ("solution_id", "user_id")
);
