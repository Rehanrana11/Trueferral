import sys

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
        return EntityId("eid_test_123")


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


class FakeAuth:
    def __init__(self, subject_val: str | None) -> None:
        self._s = subject_val

    def subject(self):
        return self._s


def _override_service(subject: str | None):
    repo = FakeRepo()
    svc = CreateIntroReceiptService(repo=repo, clock=FakeClock(), id_generator=FakeIdGen())

    def _svc():
        return svc

    def _auth():
        return FakeAuth(subject)

    app.dependency_overrides[api_deps.get_intro_receipt_service] = _svc
    app.dependency_overrides[api_deps.get_auth_context] = _auth
    return repo


def test_post_intro_receipt_happy_path_is_deterministic():
    repo = _override_service(subject="user_abc")
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"counterparty": "Mike", "note": "hi"})
    assert r.status_code == 200, r.text
    body = r.json()

    assert body["receipt_id"] == "eid_test_123"
    assert body["created_at"] == "2026-02-01T00:00:00+00:00"
    assert body["created_by"] == "user_abc"
    assert body["counterparty"] == "Mike"
    assert body["note"] == "hi"

    assert len(repo.added) == 1
    app.dependency_overrides.clear()


def test_post_intro_receipt_unauthorized_when_subject_missing():
    _override_service(subject=None)
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"counterparty": "Mike", "note": None})
    assert r.status_code == 401
    app.dependency_overrides.clear()


def test_post_intro_receipt_validation_422_for_missing_field():
    _override_service(subject="user_abc")
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"note": "x"})
    assert r.status_code == 422
    app.dependency_overrides.clear()


def test_api_layer_import_is_pure():
    """
    Verify that importing introflow.api.routes does NOT pull in
    DB/ORM modules (sqlalchemy, alembic, psycopg).
    
    Uses the same isolation pattern as Steps 41, 44, 45.
    """
    before = set(sys.modules.keys())

    # Clear API modules to force fresh import
    mods_to_clear = [k for k in sys.modules if k.startswith("introflow.api")]
    for mod in mods_to_clear:
        del sys.modules[mod]

    # Fresh import
    import introflow.api.routes  # noqa: F401

    after = set(sys.modules.keys())
    new_imports = after - before

    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]

    assert offenders == [], f"API layer pulled forbidden modules: {offenders}"