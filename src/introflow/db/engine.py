from __future__ import annotations

from pydantic import ValidationError
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from introflow.config.settings import get_settings

_VALID_PREFIXES = (
    "postgresql://",
    "postgresql+psycopg2://",
    "postgresql+asyncpg://",
    "postgres://",
)


def get_database_url() -> str:
    s = get_settings()
    return str(s.database_url)


def _is_postgres_url(url: str) -> bool:
    return any(url.startswith(p) for p in _VALID_PREFIXES)


def create_engine_from_settings(*, echo: bool = False, pool_pre_ping: bool = True) -> Engine:
    try:
        url = get_database_url()
    except ValidationError as exc:
        raise ValueError("Invalid settings - database_url must be a valid Postgres URL") from exc
    if not _is_postgres_url(url):
        raise ValueError(
            f"database_url must be a PostgreSQL URL, got: {url[:30]}..."
        )
    return create_engine(url, echo=echo, pool_pre_ping=pool_pre_ping, future=True)


def ping_database(engine: Engine) -> bool:
    """Return True if the database is reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False