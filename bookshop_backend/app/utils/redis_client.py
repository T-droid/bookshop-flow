import asyncio
import logging
from typing import Optional

from redis.asyncio import Redis, from_url
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self, redis_url: str = "redis://localhost:6379", max_retries: int = 3, retry_delay: float = 1.0):
        self.redis_url = redis_url
        self.client: Optional[Redis] = None
        self._lock = asyncio.Lock()
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    async def init(self):
        async with self._lock:
            if self.client is not None:
                return

            for attempt in range(1, self.max_retries + 1):
                try:
                    self.client = from_url(
                        self.redis_url,
                        encoding="utf-8",
                        decode_responses=True
                    )
                    # Test connection
                    await self.client.ping()
                    logger.info("Connected to Redis on attempt %d", attempt)
                    return
                except RedisError as e:
                    logger.warning("Failed to connect to Redis (attempt %d/%d): %s", attempt, self.max_retries, str(e))
                    await asyncio.sleep(self.retry_delay)

            raise ConnectionError(f"Could not connect to Redis after {self.max_retries} attempts.")

    async def get_client(self) -> Redis:
        if self.client is None:
            await self.init()

        if self.client is None:
            raise RuntimeError("Redis client is not initialized.")

        return self.client

    async def close(self):
        async with self._lock:
            if self.client:
                try:
                    await self.client.close()
                    logger.info("Redis connection closed.")
                except RedisError as e:
                    logger.warning("Error closing Redis connection: %s", str(e))
                finally:
                    self.client = None
