import { Redis } from "@upstash/redis"

let client: Redis | null = null

/**
 * Lazily creates a singleton Upstash Redis client from the environment.
 *
 * Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
 * Reads the env only when first called, so importing this module never throws.
 */
export function getRedis(): Redis {
  if (!client) {
    client = Redis.fromEnv()
  }

  return client
}

export type { Redis }
