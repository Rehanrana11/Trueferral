import sys

from starlette.requests import Request

from introflow.auth.api import get_auth_context_from_request
from introflow.auth.boundary import HeaderAuthContext


def _make_request(headers: dict[str, str]) -> Request:
    """
    Build a minimal Starlette Request for testing.
    
    Note: Starlette stores headers as lowercase key bytes in the scope,
    but Request.headers.get() is case-insensitive. We lowercase keys
    here to match real HTTP behavior.
    """
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [(k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in headers.items()],
    }
    return Request(scope)


def test_auth_context_subject_from_header():
    req = _make_request({"X-IntroFlow-Subject": " user_abc "})
    auth = get_auth_context_from_request(req)
    assert auth.subject() == "user_abc"


def test_auth_context_missing_subject_returns_none():
    req = _make_request({})
    auth = get_auth_context_from_request(req)
    assert auth.subject() is None


def test_auth_context_subject_from_bearer_passthrough():
    req = _make_request({"Authorization": "Bearer token_xyz"})
    auth = get_auth_context_from_request(req)
    assert auth.subject() == "token_xyz"


def test_auth_import_is_pure():
    """
    Importing introflow.auth must NOT load DB/ORM modules.
    """
    before = set(sys.modules.keys())

    # Clear to force fresh imports
    mods_to_clear = [k for k in sys.modules if k.startswith("introflow.auth")]
    for m in mods_to_clear:
        del sys.modules[m]

    import introflow.auth  # noqa: F401

    after = set(sys.modules.keys())
    new_imports = after - before

    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]
    assert offenders == [], f"Auth boundary pulled forbidden modules: {offenders}"