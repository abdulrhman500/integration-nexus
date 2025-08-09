import httpx
from typing import Optional, Dict, Any
from config.logger_config import logger

async def fetch(
    method: str,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    body: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 10
):
    logger.info(f"Out call {method} {url}")
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                params=params,
                json=body,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error {e.response.status_code} while requesting {url}: {e}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error while requesting {url}: {e}")
        raise
