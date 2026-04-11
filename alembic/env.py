from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection

# Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata will be plugged in Step 44+ (models/metadata).
target_metadata = None


def _get_url() -> str:
    # Pull URL from IntroFlow settings via Step 42 (single source of truth)
    from introflow.db.engine import get_database_url  # local import to avoid side effects at module import time

    return get_database_url()


def run_migrations_offline() -> None:
    """
    Offline mode: configures context with URL only.
    No Engine/Connection is created.
    """
    url = _get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Online mode: creates Engine + connects.
    This is the ONLY place DB connection happens.
    """
    from introflow.db.engine import create_engine_from_settings  # local import to avoid side effects

    engine = create_engine_from_settings(pool_pre_ping=True)

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()