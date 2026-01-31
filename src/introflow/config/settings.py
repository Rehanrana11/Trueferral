from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Step 34 (Config Validation):
    - Fail fast on missing/invalid env vars
    - No implicit defaults for required secrets/URLs
    - Explicit types + strict validation
    """

    model_config = SettingsConfigDict(
        env_prefix="INTROFLOW_",
        case_sensitive=False,
        extra="forbid",
    )

    # REQUIRED (fast-fail)
    database_url: AnyUrl = Field(..., description="Postgres connection URL")

    # OPTIONAL but validated
    app_env: Literal["dev", "test", "prod"] = Field("dev", description="Runtime environment")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field("INFO", description="Log level")
    log_json: bool = Field(False, description="Emit JSON logs")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    # Single source of truth settings object (cached)
    return Settings()