"""
Domain primitives only.

These types exist to keep the rest of the app consistent without importing infra/framework code.
No side effects. No env reads.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import NewType
from uuid import UUID, uuid4

EntityId = NewType("EntityId", str)
CorrelationId = NewType("CorrelationId", str)

def UtcNow() -> datetime:
    """UTC timestamp helper for domain use (pure)."""
    return datetime.now(timezone.utc)

@dataclass(frozen=True, slots=True)
class UlidLike:
    """
    Minimal unique-id wrapper (not a full ULID implementation).
    Purpose: stable string IDs without bringing dependencies into domain.
    """
    value: str

    @staticmethod
    def new() -> "UlidLike":
        # UUID4 is acceptable here as a placeholder primitive.
        return UlidLike(value=str(uuid4()))

    def __str__(self) -> str:
        return self.value

def NewEntityId() -> EntityId:
    """Factory for EntityId (pure)."""
    return EntityId(str(uuid4()))

def NewCorrelationId() -> CorrelationId:
    """Factory for CorrelationId (pure)."""
    return CorrelationId(str(uuid4()))

def ParseUUID(value: str) -> UUID:
    """Parse UUID string (pure)."""
    return UUID(value)