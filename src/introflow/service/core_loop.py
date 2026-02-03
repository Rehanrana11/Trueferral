from __future__ import annotations

"""
Step 45: Service Layer (Core Loop v0)

Hard rules:
- NO IO (no DB/network/filesystem)
- NO framework imports (FastAPI, SQLAlchemy, Alembic, etc.)
- NO env reads
- Deterministic logic only
- Repos are Protocol-based boundaries (Step 44)
"""

from dataclasses import dataclass
from typing import Optional

from introflow.domain.contracts import AuthContext, Clock, IdGenerator
from introflow.domain.types import EntityId
from introflow.repository.base import CrudRepository

from .errors import UnauthorizedError, ValidationError


@dataclass(frozen=True, slots=True)
class IntroReceipt:
    """
    Minimal v0 record created by the core loop.

    NOTE: This is intentionally small and schema-agnostic.
    Persistence implementation arrives in later steps.
    """
    receipt_id: EntityId
    created_at_utc_iso: str
    created_by: str  # subject from AuthContext
    counterparty: str  # who the intro is for (free-form, v0)
    note: Optional[str] = None


@dataclass(frozen=True, slots=True)
class CreateIntroReceiptCommand:
    """
    Command object for deterministic service call.
    Keep fields explicit; validation happens in service.
    """
    counterparty: str
    note: Optional[str] = None


@dataclass(frozen=True, slots=True)
class CreateIntroReceiptResult:
    receipt: IntroReceipt


class CreateIntroReceiptService:
    """
    Core Loop v0: Create an Intro Receipt.

    Determinism:
    - ID from injected IdGenerator
    - timestamp from injected Clock
    - subject from injected AuthContext
    """

    def __init__(
        self,
        *,
        repo: CrudRepository[IntroReceipt],
        clock: Clock,
        id_generator: IdGenerator,
    ) -> None:
        self._repo = repo
        self._clock = clock
        self._ids = id_generator

    def create(self, *, cmd: CreateIntroReceiptCommand, auth: AuthContext) -> CreateIntroReceiptResult:
        subject = auth.subject()
        if not subject:
            raise UnauthorizedError("auth.subject is required")

        counterparty = (cmd.counterparty or "").strip()
        if not counterparty:
            raise ValidationError("counterparty is required")

        receipt = IntroReceipt(
            receipt_id=self._ids.new_entity_id(),
            created_at_utc_iso=self._clock.now_utc_iso(),
            created_by=subject,
            counterparty=counterparty,
            note=(cmd.note.strip() if isinstance(cmd.note, str) and cmd.note.strip() else None),
        )

        # No IO here; repo is a boundary. A fake repo is used in tests.
        self._repo.add(receipt)

        return CreateIntroReceiptResult(receipt=receipt)