"""
Domain package (pure business concepts).

Hard rules:
- NO IO (no filesystem, network, DB)
- NO framework imports (FastAPI, SQLAlchemy, etc.)
- NO env reads (no os.environ usage)
- OK: typing, dataclasses, datetime, uuid
"""

from .types import EntityId, CorrelationId, UtcNow

__all__ = [
    "EntityId",
    "CorrelationId",
    "UtcNow",
]