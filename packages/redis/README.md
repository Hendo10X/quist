# @workspace/redis

Upstash Redis client for Quist (query caching — see the PRD's search architecture).

## Usage

```ts
import { getRedis } from "@workspace/redis"

const redis = getRedis()
await redis.set("key", "value")
```

## Environment

```
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

The client is created lazily on first `getRedis()` call, so importing this
package without the env set is safe.
