from __future__ import annotations

from typing import Protocol, TypeVar, Iterable, Optional
from introflow.domain.types import EntityId

T = TypeVar("T")

class CrudRepository(Protocol[T]):
    """
    Generic CRUD repository interface.

    Implementations live in infra layer (later steps).
    """

    def get(self, entity_id: EntityId) -> Optional[T]:
        ...

    def list(self, *, limit: int = 100, offset: int = 0) -> Iterable[T]:
        ...

    def add(self, entity: T) -> None:
        ...

    def update(self, entity: T) -> None:
        ...

    def delete(self, entity_id: EntityId) -> None:
        ...