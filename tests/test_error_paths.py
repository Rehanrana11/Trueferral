from __future__ import annotations

import pytest
import sys

from fastapi.testclient import TestClient

from introflow.app import app
from introflow.api import deps as api_deps
from introflow.config.settings import get_settings
from introflow.domain.types import EntityId
from introflow.service.core_loop import CreateIntroReceiptService, IntroReceipt


class FakeClock:
    def now_utc_iso(self) -> str:
        return "2026-02-01T00:00:00+00:00"


class FakeIdGen:
    def new_entity_id(self) -> EntityId:
        return EntityId("eid_err_123")


class FakeRepo:
    def __init__(self) -> None:
        self.added = []

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


def _override_service_with_repo() -> FakeRepo:
    repo = FakeRepo()
    svc = CreateIntroReceiptService(repo=repo, clock=FakeClock(), id_generator=FakeIdGen())

    def _svc():
        return svc

    app.dependency_overrides[api_deps.get_intro_receipt_service] = _svc
    return repo


def _assert_observability_headers(r, expected_cid: str):
    assert r.headers.get("X-Correlation-Id") == expected_cid
    v = r.headers.get("X-Request-Duration-Ms")
    assert v is not None
    ms = int(v)
    assert ms >= 0


def test_error_path_missing_required_field_422():
    c = TestClient(app)
    cid = "cid_err_1234"
    r = c.post(
        "/v1/intro-receipts",
        json={"note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": cid},
    )
    assert r.status_code == 422, r.text
    _assert_observability_headers(r, cid)


def test_error_path_unknown_field_422():
    c = TestClient(app)
    cid = "cid_err_1234"
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Mike", "note": "hi", "hacker": True},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": cid},
    )
    assert r.status_code == 422, r.text
    _assert_observability_headers(r, cid)


def test_error_path_type_mismatch_422():
    c = TestClient(app)
    cid = "cid_err_1234"
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": 123, "note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": cid},
    )
    assert r.status_code == 422, r.text
    _assert_observability_headers(r, cid)


def test_error_path_whitespace_counterparty_422():
    c = TestClient(app)
    cid = "cid_err_1234"
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "   ", "note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": cid},
    )
    assert r.status_code == 422, r.text
    _assert_observability_headers(r, cid)


def test_error_path_unauthorized_missing_subject_401():
    repo = _override_service_with_repo()
    try:
        c = TestClient(app)
        cid = "cid_err_1234"
        r = c.post(
            "/v1/intro-receipts",
            json={"counterparty": "Mike", "note": "hi"},
            headers={"X-Correlation-Id": cid},
        )
        assert r.status_code == 401, r.text
        _assert_observability_headers(r, cid)
        assert len(repo.added) == 0
    finally:
        app.dependency_overrides.clear()


def test_error_path_missing_database_url_fails_fast(monkeypatch):
    monkeypatch.delenv("INTROFLOW_DATABASE_URL", raising=False)
    get_settings.cache_clear()
    try:
        with pytest.raises(Exception) as e:
            _ = get_settings()
        assert "database_url" in str(e.value).lower()
    finally:
        get_settings.cache_clear()


def test_step_52_import_purity():
    before = set(sys.modules.keys())
    mods_to_clear = [k for k in sys.modules if k.endswith("test_error_paths")]
    for mod in mods_to_clear:
        del sys.modules[mod]
    after = set(sys.modules.keys())
    new_imports = after - before
    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]
    assert offenders == [], f"Step 52 tests pulled forbidden modules: {offenders}"