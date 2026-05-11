# app/core/config.py
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent   
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REDIS_URL: str="redis://localhost:6379"

    model_config = SettingsConfigDict(
        env_file="C:/Users/sayan/Downloads/sayan/project/pulsepost/.env",     
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def async_database_url(self) -> str:
        """
        Render provides DATABASE_URL as postgresql://...
        SQLAlchemy async needs postgresql+asyncpg://...
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

settings = Settings()