"""
Auth boundary (Step 47).

This package freezes the v0 auth surface area.
Real auth integration arrives in later steps.

Hard rules:
- Deterministic
- No env reads
- No DB/SQLAlchemy/Alembic imports
"""
from .boundary import HeaderAuthContext
from .api import get_auth_context_from_request

__all__ = ["HeaderAuthContext", "get_auth_context_from_request"]