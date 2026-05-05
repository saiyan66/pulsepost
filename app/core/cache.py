import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings


redis_client = aioredis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)


async def get_cached(key: str) -> Any | None:
    """
    Read a value from Redis by key.
    Returns the parsed Python object if it exists, None if it doesn't.
    stores everything as JSON strings — get_cached deserializes back.
    """
    value = await redis_client.get(key)
    if value is None:
        return None
    return json.loads(value)


async def set_cached(key: str, value: Any, expire_seconds: int = 300) -> None:
    """
    Write a value to Redis.
    serialize to JSON because Redis stores strings, not Python objects.
    """
    await redis_client.set(key, json.dumps(value), ex=expire_seconds)


async def delete_cached(key: str) -> None:
    """
    Called when a post is updated or deleted — so stale data doesn't
    get served from cache after the DB has changed.
    """
    await redis_client.delete(key)


async def delete_pattern(pattern: str) -> None:
    """
    Example: delete_pattern("posts:list:*") clears all post list caches
    when a new post is created — so the new post appears immediately.
    """
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)