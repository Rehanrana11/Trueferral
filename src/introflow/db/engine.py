from __future__ import annotations

"""
Step 42: DB Connectivity Module (Postgres URL only)

Hard rules:
- URL comes ONLY from introflow.config.settings.get_settings()
- No direct os.environ usage here
- No DB queries here (engine creation only)
- CI parity: must work on clean runner with env provided
"""

from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from introflow.config.settings import get_settings


def get_database_url() -> str:
    """
    Return the validated database URL as a string.
    Settings already enforces 'INTROFLOW_' env prefix.
    """
    s = get_settings()
    return str(s.database_url)


def _is_postgres_url(url: str) -> bool:
    # Accept canonical SQLAlchemy URL schemes
    return url.startswith("postgresql://") or url.startswith("postgres://")


def create_engine_from_settings(*, echo: bool = False, pool_pre_ping: bool = True) -> Engine:
    """
    Create a SQLAlchemy Engine WITHOUT connecting.
    No queries are executed here. This is a pure factory.
    """
    url = get_database_url()
    
    # VALIDATE BEFORE creating engine (this is the fix)
    if not _is_postgres_url(url):
        raise ValueError(f"database_url must be Postgres (postgresql:// or postgres://), got: {url.split('://')[0]}://...")
    
    return create_engine(url, echo=echo, pool_pre_ping=pool_pre_ping, future=True)