from __future__ import annotations

import os
import uuid
import logging
from typing import Any, Dict

import structlog

REDACT_KEYS = {"password", "secret", "token", "api_key", "authorization"}


def _redact(_, __, event_dict: Dict[str, Any]) -> Dict[str, Any]:
    for k in list(event_dict.keys()):
        if k.lower() in REDACT_KEYS:
            event_dict[k] = "***REDACTED***"
    return event_dict


def _ensure_request_id(_, __, event_dict: Dict[str, Any]) -> Dict[str, Any]:
    event_dict.setdefault("request_id", str(uuid.uuid4()))
    return event_dict


def get_logger(name: str | None = None):
    json_logs = os.getenv("INTROFLOW_LOG_JSON", "false").lower() == "true"

    processors = [
        _ensure_request_id,
        _redact,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
        if json_logs
        else structlog.processors.KeyValueRenderer(),
    ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        cache_logger_on_first_use=True,
    )

    return structlog.get_logger(name)


def bind_request_id(logger, request_id: str | None = None):
    return logger.bind(request_id=request_id or str(uuid.uuid4()))