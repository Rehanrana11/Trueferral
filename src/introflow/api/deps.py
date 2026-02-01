from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from introflow.domain.contracts import AuthContext
from introflow.domain.types import EntityId
from introflow.service.core_loop import CreateIntroReceiptService, IntroReceipt


class _UtcClock:
    def now_utc_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()


class _UuidIdGenerator:
    def new_entity_id(self) -> EntityId:
        from introflow.domain.types import NewEntityId
        return NewEntityId()


class _NoopIntroReceiptRepo:
    def add(self, entity: IntroReceipt) -> None:
        pass

    def get(self, entity_id: EntityId) -> Optional[IntroReceipt]:
        return None

    def list(self, *, limit: int = 100, offset: int = 0):
        return ()

    def update(self, entity: IntroReceipt) -> None:
        pass

    def delete(self, entity_id: EntityId) -> None:
        pass


@dataclass(frozen=True, slots=True)
class _NullAuth:
    def subject(self) -> Optional[str]:
        return None


def get_auth_context():
    """Step 47 will replace this with real auth boundary."""
    return _NullAuth()


def get_intro_receipt_service():
    """Build service with default deps (resolved internally)."""
    return CreateIntroReceiptService(
        repo=_NoopIntroReceiptRepo(),
        clock=_UtcClock(),
        id_generator=_UuidIdGenerator(),
    )