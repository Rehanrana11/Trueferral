import os
import json
import pytest
import structlog

from introflow.logging import get_logger, bind_request_id


@pytest.fixture(autouse=True)
def reset_structlog():
    """Reset structlog state between tests"""
    structlog.reset_defaults()
    yield
    structlog.reset_defaults()


def test_request_id_is_added(capsys):
    logger = get_logger("test")
    logger.info("hello")
    out = capsys.readouterr().out
    assert "request_id" in out


def test_secret_is_redacted(capsys):
    logger = get_logger("test")
    logger.info("login", password="1234", token="abcd")
    out = capsys.readouterr().out
    assert "***REDACTED***" in out
    assert "1234" not in out
    assert "abcd" not in out


def test_json_logging(monkeypatch, capsys):
    monkeypatch.setenv("INTROFLOW_LOG_JSON", "true")
    logger = get_logger("json-test")
    logger.info("event", foo="bar")
    out = capsys.readouterr().out
    parsed = json.loads(out)
    assert parsed["foo"] == "bar"
    assert "request_id" in parsed


def test_bind_request_id_overrides(capsys):
    logger = get_logger("bind")
    logger = bind_request_id(logger, "req-123")
    logger.info("event")
    out = capsys.readouterr().out
    assert "req-123" in out