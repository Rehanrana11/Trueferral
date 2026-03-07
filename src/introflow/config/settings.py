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
        if not v.startswith("postgresql://"):
            raise ValueError("database_url must start with postgresql://")
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
