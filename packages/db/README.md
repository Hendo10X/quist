# @workspace/db

Drizzle ORM schema and Neon (PostgreSQL) client for Quist.

## Exports

- `@workspace/db` — `db` client and the `schema` namespace
- `@workspace/db/schema` — raw Drizzle tables
- `@workspace/db/client` — the `db` client only

## Environment

Set `DATABASE_URL` to your Neon connection string (use the pooled connection
string for serverless).

```
DATABASE_URL="postgresql://..."
```

## Scripts

```bash
bun run db:generate   # generate SQL migrations from the schema
bun run db:migrate    # apply migrations
bun run db:push       # push the schema directly (dev only)
bun run db:studio     # open Drizzle Studio
```

The auth tables (`user`, `session`, `account`, `verification`) match what
Better Auth expects. The Better Auth instance itself lives in `apps/web/lib/auth.ts`.
