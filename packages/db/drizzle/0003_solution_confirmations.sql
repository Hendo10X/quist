-- Custom migration: "worked for me" confirmations on `solutions`.
-- `bun run db:push` applies the equivalent from the Drizzle schema; this file
-- documents the exact SQL and can be run by hand in the Neon SQL editor.
--
-- The join table records one confirmation per (user, solution); the count is
-- denormalized onto solutions.confirmation_count for cheap ranking/display.

ALTER TABLE "solutions"
  ADD COLUMN IF NOT EXISTS "confirmation_count" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "solution_confirmations" (
  "solution_id" uuid NOT NULL REFERENCES "solutions"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "solution_confirmations_solution_id_user_id_pk"
    PRIMARY KEY ("solution_id", "user_id")
);
