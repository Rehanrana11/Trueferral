import pytest
import structlog

from introflow.errors import (
    AppError,
    BadRequestError,
    InternalError,
    to_error_response,
    safe_error_payload,
)


@pytest.fixture(autouse=True)
def reset_structlog():
    """Reset structlog state between tests"""
    structlog.reset_defaults()
    yield
    structlog.reset_defaults()


def test_app_error_maps_cleanly_with_status_and_code():
    err = BadRequestError("Bad request.", details={"field": "x"})
    r = to_error_response(err, request_id="req-1")
    assert r.status == 400
    assert r.code == "bad_request"
    assert r.request_id == "req-1"
    assert r.details == {"field": "x"}
    d = r.to_dict()
    assert d["error"]["code"] == "bad_request"
    assert d["error"]["message"] == "Bad request."
    assert d["request_id"] == "req-1"


def test_unknown_exception_does_not_leak_raw_message(capsys):
    class SecretException(Exception):
        pass

    exc = SecretException("password=SUPERSECRET token=abcd")
    r = to_error_response(exc, request_id="req-2")
    assert r.status == 500
    assert r.code == "internal_error"
    assert r.message == "Internal server error."
    
    # Ensure the secret is not present anywhere in payload
    payload = safe_error_payload(exc, request_id="req-2")
    blob = str(payload)
    assert "SUPERSECRET" not in blob
    assert "token" not in blob
    assert "password" not in blob
    
    # Verify error was logged (but secret still redacted in logs)
    out = capsys.readouterr().out
    assert "unexpected_error" in out
    assert "req-2" in out


def test_value_error_maps_to_bad_request_without_leak():
    exc = ValueError("db_url leaked here")
    r = to_error_response(exc, request_id="req-3")
    assert r.status == 400
    assert r.code == "bad_request"
    assert r.message == "Bad request."
    assert "db_url" not in str(safe_error_payload(exc, request_id="req-3"))


def test_internal_error_is_app_error_and_safe():
    err = InternalError()
    r = to_error_response(err, request_id="req-4")
    assert r.status == 500
    assert r.code == "internal_error"
    assert r.message == "Internal server error."


def test_error_logging_includes_correlation_id(capsys):
    """Verify errors are logged with correlation IDs for tracing"""
    err = BadRequestError("Invalid input")
    to_error_response(err, request_id="trace-123")
    
    out = capsys.readouterr().out
    assert "trace-123" in out
    assert "application_error" in out
    assert "bad_request" in out