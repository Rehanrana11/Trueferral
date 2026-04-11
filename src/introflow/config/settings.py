from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    app_env: Literal["development", "production"] = "development"
    log_json: bool = False
    secret_key: str = "dev-secret-key"

    model_config = {
        "env_prefix": "INTROFLOW_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    @field_validator("database_url")
    @classmethod
    def must_be_postgres(cls, v: str) -> str:
        """
        Accept all standard PostgreSQL URL schemes:
          - postgresql://
          - postgresql+psycopg2://
          - postgresql+asyncpg://
          - postgres://  (legacy Heroku/Render style)
        """
        valid_prefixes = (
            "postgresql://",
            "postgresql+psycopg2://",
            "postgresql+asyncpg://",
            "postgres://",
        )
        if not any(v.startswith(p) for p in valid_prefixes):
            raise ValueError(
                "database_url must start with postgresql://, "
                "postgresql+psycopg2://, postgresql+asyncpg://, or postgres://"
            )
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()