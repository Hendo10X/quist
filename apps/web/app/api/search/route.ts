import { handle } from "hono/vercel"

import { api } from "@/lib/search-api"

export const GET = handle(api)
