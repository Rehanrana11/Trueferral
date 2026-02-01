"""
Domain contracts (interfaces) only.

No implementations here. These exist so services/repos can agree on boundaries
without importing infra/framework dependencies into the domain layer.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable, Optional

from .types import EntityId

@runtime_checkable
class Clock(Protocol):
    def now_utc_iso(self) -> str:
        """Return an ISO-8601 UTC timestamp string."""
        ...

@runtime_checkable
class IdGenerator(Protocol):
    def new_entity_id(self) -> EntityId:
        ...

@runtime_checkable
class Repo(Protocol):
    """
    Placeholder boundary: concrete repos live in infra layer (Step 44).
    Domain defines shape only.
    """
    def ping(self) -> bool:
        ...

@runtime_checkable
class AuthContext(Protocol):
    """
    Placeholder boundary: concrete auth lives in Step 47.
    """
    def subject(self) -> Optional[str]:
        ...