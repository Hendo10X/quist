-- Custom migration: draft/published status + updated_at on `solutions`.
-- `bun run db:push` applies the equivalent from the Drizzle schema; this file
-- documents the exact SQL and can be run by hand in the Neon SQL editor.
--
-- Both column adds are backfilled by their DEFAULTs, so existing rows become
-- published and get an updated_at of now(). Safe to run on a live table.

DO $$ BEGIN
  CREATE TYPE "solution_status" AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "solutions"
  ADD COLUMN IF NOT EXISTS "status" "solution_status" NOT NULL DEFAULT 'published';

ALTER TABLE "solutions"
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();
