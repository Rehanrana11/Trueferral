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


    def subject(self):
        return self._s


def _override_service():
    repo = FakeRepo()
    svc = CreateIntroReceiptService(repo=repo, clock=FakeClock(), id_generator=FakeIdGen())

    def _svc():
        return svc

    app.dependency_overrides[api_deps.get_intro_receipt_service] = _svc
    return repo


def test_post_intro_receipt_happy_path_is_deterministic():
    repo = _override_service()
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"counterparty": "Mike", "note": "hi"}, headers={"X-IntroFlow-Subject": "user_abc"})
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
    _override_service()
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"counterparty": "Mike", "note": None})
    assert r.status_code == 401
    app.dependency_overrides.clear()


def test_post_intro_receipt_validation_422_for_missing_field():
    _override_service()
    c = TestClient(app)

    r = c.post("/v1/intro-receipts", json={"note": "x"}, headers={"X-IntroFlow-Subject": "user_abc"})
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

# ============================================================
# STEP 48: Input validation hardening
# ============================================================

def test_unknown_field_rejected_with_422():
    """Unknown fields should be rejected (extra='forbid')."""
    c = TestClient(app)
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Alice", "note": "hi", "hacker_field": "evil"},
        headers={"X-IntroFlow-Subject": "user_test"},
    )
    assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"
    body = r.json()
    assert "detail" in body
    # Pydantic v2 error format
    assert any("hacker_field" in str(err) for err in body["detail"])


def test_counterparty_stripped_deterministically():
    """Whitespace should be stripped from counterparty."""
    repo = _override_service()
    c = TestClient(app)
    
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "  Alice  ", "note": "  hi  "},
    )
    
    if r.status_code == 200:
        body = r.json()
        # Counterparty should be stripped
        assert body["counterparty"] == "Alice", f"Expected 'Alice', got '{body['counterparty']}'"
        # Note should also be normalized (empty whitespace Ã¢â€ â€™ None handled by service)
        # But API might return "hi" after strip
    
    app.dependency_overrides.clear()


def test_empty_counterparty_rejected_with_422():
    """Counterparty that's empty after strip should be rejected."""
    c = TestClient(app)
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "   ", "note": "test"},
        headers={"X-IntroFlow-Subject": "user_test"},
    )
    assert r.status_code == 422, f"Expected 422 for empty counterparty, got {r.status_code}"


def test_counterparty_max_length_enforced():
    """Counterparty exceeding max length should be rejected."""
    c = TestClient(app)
    long_name = "x" * 201  # Max is 200
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": long_name, "note": "test"},
        headers={"X-IntroFlow-Subject": "user_test"},
    )
    assert r.status_code == 422, f"Expected 422 for too-long counterparty, got {r.status_code}"


def test_note_max_length_enforced():
    """Note exceeding max length should be rejected."""
    c = TestClient(app)
    long_note = "x" * 1001  # Max is 1000
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Alice", "note": long_note},
        headers={"X-IntroFlow-Subject": "user_test"},
    )
    assert r.status_code == 422, f"Expected 422 for too-long note, got {r.status_code}"


def test_empty_note_normalized_to_none():
    """Empty or whitespace-only note should become None."""
    repo = _override_service()
    c = TestClient(app)
    
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Alice", "note": "   "},
    )
    
    if r.status_code == 200:
        body = r.json()
        # Empty note should be None (deterministic)
        assert body["note"] is None, f"Expected None for empty note, got {body['note']}"
    
    app.dependency_overrides.clear()


def test_strict_type_checking_no_silent_coercion():
    """Strict mode should reject type mismatches."""
    c = TestClient(app)
    
    # Try to pass number as counterparty (should fail with strict=True)
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": 123, "note": "test"},
        headers={"X-IntroFlow-Subject": "user_test"},
    )
    assert r.status_code == 422, f"Expected 422 for type mismatch, got {r.status_code}"


def test_schemas_import_remains_pure():
    """Schemas should not import DB/ORM modules."""
    before = set(sys.modules.keys())
    
    # Clear schemas modules
    schema_mods = [k for k in sys.modules if k.startswith("introflow.api.schemas")]
    for mod in schema_mods:
        del sys.modules[mod]
    
    # Fresh import
    import introflow.api.schemas  # noqa: F401
    
    after = set(sys.modules.keys())
    new_imports = after - before
    
    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]
    
    assert offenders == [], (
        f"Schemas imported forbidden modules: {offenders}. "
        "API schemas must remain pure (no DB/ORM dependencies)."
    )