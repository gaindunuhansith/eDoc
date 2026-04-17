import requests
import logging
from typing import Optional, Any, Dict, List

logger = logging.getLogger(__name__)

class HTTPClient:
    @staticmethod
    def get(url: str, timeout: int = 5) -> Any:
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                return None
            logger.error(f"HTTP Error querying {url}: {e}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error querying {url}: {e}")
        return None
