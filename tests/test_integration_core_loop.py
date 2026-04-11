from __future__ import annotations

from fastapi.testclient import TestClient

from introflow.app import app
from introflow.api import deps as api_deps
from introflow.domain.types import EntityId
from introflow.service.core_loop import CreateIntroReceiptService, IntroReceipt


class FakeClock:
    def now_utc_iso(self) -> str:
        return "2026-02-01T00:00:00+00:00"


class FakeIdGen:
    def new_entity_id(self) -> EntityId:
        return EntityId("eid_it_123")


class FakeRepo:
    def __init__(self) -> None:
        self.added: list[IntroReceipt] = []

    def add(self, entity: IntroReceipt) -> None:
        self.added.append(entity)

    def get(self, entity_id: EntityId):
        return None

    def list(self, *, limit: int = 100, offset: int = 0):
        return ()

    def update(self, entity: IntroReceipt) -> None:
        pass

    def delete(self, entity_id: EntityId) -> None:
        pass


def _override_intro_receipt_service() -> FakeRepo:
    repo = FakeRepo()
    svc = CreateIntroReceiptService(repo=repo, clock=FakeClock(), id_generator=FakeIdGen())

    def _svc():
        return svc

    app.dependency_overrides[api_deps.get_intro_receipt_service] = _svc
    return repo


def test_integration_core_loop_happy_path_end_to_end():
    repo = _override_intro_receipt_service()
    c = TestClient(app)

    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Mike", "note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": "cid_test_123"},
    )

    assert r.status_code == 200, r.text
    body = r.json()

    assert body["receipt_id"] == "eid_it_123"
    assert body["created_at"] == "2026-02-01T00:00:00+00:00"
    assert body["created_by"] == "user_abc"
    assert body["counterparty"] == "Mike"
    assert body["note"] == "hi"

    assert len(repo.added) == 1
    added = repo.added[0]
    assert str(added.receipt_id) == body["receipt_id"]

    assert r.headers.get("X-Correlation-Id") == "cid_test_123"
    dur = r.headers.get("X-Request-Duration-Ms")
    assert dur is not None and int(dur) >= 0

    app.dependency_overrides.clear()


def test_integration_rejects_without_subject():
    repo = _override_intro_receipt_service()
    c = TestClient(app)

    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Mike", "note": "hi"},
        headers={"X-Correlation-Id": "cid_test_123"},
    )

    assert r.status_code == 401
    assert len(repo.added) == 0
    app.dependency_overrides.clear()