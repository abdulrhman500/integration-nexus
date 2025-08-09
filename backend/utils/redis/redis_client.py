import os
import redis.asyncio as redis
from config.logger_config import logger
from kombu.utils.url import safequote

class RedisClient:

    class KeyNamer:
        @staticmethod
        def get_access_token_key(org_id: str, user_id: str, integration_name:str) -> str:
            return f"{integration_name}:{org_id}:{user_id}:access_token"

        @staticmethod
        def get_refresh_token_key(org_id: str, user_id: str, integration_name:str) -> str:
            return f"{integration_name}:{org_id}:{user_id}:refresh_token"

        @staticmethod
        def get_state_token_key(org_id: str, user_id: str, integration_name:str) -> str:
            return f"{integration_name}:{org_id}:{user_id}:oauth_state_nonce"

    def __init__(self, host: str | None = None, port: int = 6379, db: int = 0):
        redis_host = host or os.environ.get('REDIS_HOST', 'localhost')
        safe_host = safequote(redis_host)
        self.redis_client = redis.Redis(host=safe_host, port=port, db=db, decode_responses=True)
        logger.info("Redis client initialized.")

    async def add_key(self, key: str, value: str, expire_seconds: int | None = None):
        await self.redis_client.set(key, value)
        if expire_seconds:
            await self.redis_client.expire(key, expire_seconds)
        logger.info(f"Added key '{key}' to Redis.")    

    async def get_key(self, key: str) -> str | None:
        value = await self.redis_client.get(key)
        if value:
            logger.info(f"Retrieved key '{key}' from Redis.")
        else:
            logger.warning(f"Attempted to get non-existent key '{key}'.")
        return value

    async def delete_key(self, key: str) -> int:
        result = await self.redis_client.delete(key)
        if result > 0:
            logger.info(f"Deleted key '{key}' from Redis.")
        return result
    

# async def main():
    # ... (main function is good as is) ...
    # redis_service = RedisClient()
    # state_key = redis_service.KeyNamer.get_state_token_key("org_123", "user_abc")
    # await redis_service.add_key(state_key, "a-secret-nonce", expire_seconds=60)
    # retrieved_value = await redis_service.get_key(state_key)
    # print(f"Retrieved value for key '{state_key}': {retrieved_value}")
    # await redis_service.delete_key(state_key)