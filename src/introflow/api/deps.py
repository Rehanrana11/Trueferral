from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import Request

from introflow.domain.contracts import AuthContext
from introflow.domain.types import EntityId
from introflow.auth.api import get_auth_context_from_request
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


def get_auth_context(request: Request) -> AuthContext:
    """Step 47: Auth boundary v0 (stub allowed; interface frozen)."""
    return get_auth_context_from_request(request)


def get_intro_receipt_service():
    """Build service with default deps (resolved internally)."""
    return CreateIntroReceiptService(
        repo=_NoopIntroReceiptRepo(),
        clock=_UtcClock(),
        id_generator=_UuidIdGenerator(),
    )