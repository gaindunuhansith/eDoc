import requests
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

class HTTPClient:
    @staticmethod
    def get(url: str, token: Optional[str] = None, timeout: int = 5) -> Any:
        headers = {}
        if token:
            headers["Authorization"] = token if token.startswith("Bearer ") else f"Bearer {token}"
        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP Error querying {url}: {e}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error querying {url}: {e}")
        return None
