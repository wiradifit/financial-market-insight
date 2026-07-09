from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = ['http://localhost:3000']
    RATE_LIMIT: str = '100/minute'
    CACHE_TTL: int = 60
    LOG_LEVEL: str = 'INFO'
    HOST: str = '0.0.0.0'
    PORT: int = 8000

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

settings = Settings()
