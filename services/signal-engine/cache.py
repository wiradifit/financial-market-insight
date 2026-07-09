import time
from typing import Any, Optional
import threading

class SimpleCache:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            item = self._cache.get(key)
            if item is None:
                return None
            
            value, expires_at = item
            if expires_at is not None and time.time() > expires_at:
                del self._cache[key]
                return None
                
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        with self._lock:
            expires_at = time.time() + ttl if ttl is not None else None
            self._cache[key] = (value, expires_at)

    def clear(self):
        with self._lock:
            self._cache.clear()

    def delete(self, key: str):
        with self._lock:
            if key in self._cache:
                del self._cache[key]

cache = SimpleCache()
