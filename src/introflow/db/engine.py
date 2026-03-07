from __future__ import annotations

from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from introflow.config.settings import get_settings


def get_database_url() -> str:
    s = get_settings()
    return str(s.database_url)


def _is_postgres_url(url: str) -> bool:
    return url.startswith("postgresql://") or url.startswith("postgres://")


def create_engine_from_settings(*, echo: bool = False, pool_pre_ping: bool = True) -> Engine:
    try:
        url = get_database_url()
    except ValidationError as exc:
        raise ValueError("must be Postgres URL") from exc
    if not _is_postgres_url(url):
        raise ValueError("must be Postgres URL")
    return create_engine(url, echo=echo, pool_pre_ping=pool_pre_ping, future=True)
