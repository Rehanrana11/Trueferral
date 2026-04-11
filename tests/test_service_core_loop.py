from __future__ import annotations

import sys
import pytest

from introflow.domain.types import EntityId
from introflow.service import (
    CreateIntroReceiptCommand,
    CreateIntroReceiptService,
    UnauthorizedError,
    ValidationError,
)
from introflow.service.core_loop import IntroReceipt


class FakeClock:
    def __init__(self, iso: str) -> None:
        self._iso = iso

    def now_utc_iso(self) -> str:
        return self._iso


class FakeIdGen:
    def __init__(self, next_id: str) -> None:
        self._next = EntityId(next_id)

    def new_entity_id(self) -> EntityId:
        return self._next


class FakeAuth:
    def __init__(self, subject: str | None) -> None:
        self._s = subject

    def subject(self) -> str | None:
        return self._s


class FakeRepo:
    def __init__(self) -> None:
        self.added: list[IntroReceipt] = []

    def get(self, entity_id: EntityId):
        raise NotImplementedError

    def list(self, *, limit: int = 100, offset: int = 0):
        raise NotImplementedError

    def add(self, entity: IntroReceipt) -> None:
        self.added.append(entity)

    def update(self, entity: IntroReceipt) -> None:
        raise NotImplementedError

    def delete(self, entity_id: EntityId) -> None:
        raise NotImplementedError


def test_service_import_is_pure():
    """Service layer should not import frameworks."""
    # Snapshot before
    before = set(sys.modules.keys())
    
    # Clear service modules to test fresh import
    service_mods = [k for k in sys.modules if k.startswith("introflow.service")]
    for mod in service_mods:
        del sys.modules[mod]
    
    # Fresh import
    import introflow.service as _svc  # noqa: F401
    
    # Snapshot after
    after = set(sys.modules.keys())
    
    # What did service import?
    new_imports = after - before
    
    # Framework prefixes that should NOT be imported by service
    forbidden = ("fastapi", "sqlalchemy", "alembic", "psycopg", "uvicorn", "pydantic_settings")
    
    # Check if service imported any frameworks
    framework_imports = [m for m in new_imports if m.startswith(forbidden)]
    
    assert framework_imports == [], (
        f"Service layer imported frameworks: {framework_imports}. "
        "Service must remain pure (no framework dependencies)."
    )


def test_create_intro_receipt_is_deterministic():
    repo = FakeRepo()
    clock = FakeClock("2026-02-01T00:00:00Z")
    ids = FakeIdGen("RID_123")
    svc = CreateIntroReceiptService(repo=repo, clock=clock, id_generator=ids)

    res = svc.create(
        cmd=CreateIntroReceiptCommand(counterparty="  Mike  ", note="  hello  "),
        auth=FakeAuth("rehan"),
    )

    assert res.receipt.receipt_id == EntityId("RID_123")
    assert res.receipt.created_at_utc_iso == "2026-02-01T00:00:00Z"
    assert res.receipt.created_by == "rehan"
    assert res.receipt.counterparty == "Mike"
    assert res.receipt.note == "hello"

    assert len(repo.added) == 1
    assert repo.added[0] == res.receipt


def test_create_intro_receipt_requires_auth_subject():
    repo = FakeRepo()
    clock = FakeClock("2026-02-01T00:00:00Z")
    ids = FakeIdGen("RID_123")
    svc = CreateIntroReceiptService(repo=repo, clock=clock, id_generator=ids)

    with pytest.raises(UnauthorizedError, match="auth.subject is required"):
        svc.create(cmd=CreateIntroReceiptCommand(counterparty="x"), auth=FakeAuth(None))


def test_create_intro_receipt_validates_counterparty():
    repo = FakeRepo()
    clock = FakeClock("2026-02-01T00:00:00Z")
    ids = FakeIdGen("RID_123")
    svc = CreateIntroReceiptService(repo=repo, clock=clock, id_generator=ids)

    with pytest.raises(ValidationError, match="counterparty is required"):
        svc.create(cmd=CreateIntroReceiptCommand(counterparty="   "), auth=FakeAuth("rehan"))


def test_intro_receipt_dataclass_is_immutable():
    """Verify IntroReceipt is frozen."""
    receipt = IntroReceipt(
        receipt_id=EntityId("R1"),
        created_at_utc_iso="2026-01-01T00:00:00Z",
        created_by="user",
        counterparty="other",
    )
    
    # Should be immutable
    with pytest.raises(Exception):  # FrozenInstanceError or AttributeError
        receipt.counterparty = "hacker"  # type: ignore