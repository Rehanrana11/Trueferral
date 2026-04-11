"""
DB connectivity boundary (Step 42).

Rules:
- Uses validated Settings.database_url (INTROFLOW_DATABASE_URL)
- No queries in Step 42
- No migrations in Step 42 (that is Step 43)
"""
from .engine import create_engine_from_settings, get_database_url

__all__ = ["create_engine_from_settings", "get_database_url"]