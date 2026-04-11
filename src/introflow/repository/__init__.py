"""
Repository layer (interfaces only).

Hard rules:
- NO SQL
- NO DB connections
- NO SQLAlchemy sessions/models
- NO FastAPI
- NO env reads
"""
from .base import CrudRepository

__all__ = ["CrudRepository"]