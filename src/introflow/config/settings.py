from pydantic_settings import BaseSettings
from pydantic import field_validator
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./trueferral.db"
    TIMEZONE_DEFAULT: str = "UTC"
    CALL_MAX_DURATION: int = 480
    CALL_MIN_DURATION: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

def get_settings() -> Settings:
    return Settings()
