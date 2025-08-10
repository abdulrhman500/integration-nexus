import httpx # type: ignore
from typing import Optional, Dict, Any
from config.logger import logger
from config.constants import HTTP_METHODS, HTTP_CONTENT_TYPE
from urllib.parse import urlencode

async def fetch(
    method: HTTP_METHODS,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    body: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 10,
    content_type: HTTP_CONTENT_TYPE = HTTP_CONTENT_TYPE.JSON,
):
    logger.info(f"Out call {method} {url}")
    try:
        if headers == None:
            headers = {}
        headers = {**headers, "content-type": content_type.value}

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(
                method=method.value,
                url=url,
                params=params,
                **(
                    {"json": body}
                    if content_type.value.capitalize() == HTTP_CONTENT_TYPE.JSON.value.capitalize()
                    else {"data": body}
                ),
                headers=headers,
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error {e.response.status_code} while requesting {url}: {e}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error while requesting {url}: {e}")
        raise

def build_url_with_params(url: str, params: dict) -> str:
    if not params:
        return url
    query_string = urlencode(params)
    return f"{url}?{query_string}"