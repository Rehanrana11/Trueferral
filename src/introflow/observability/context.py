from __future__ import annotations

from contextvars import ContextVar
from typing import Optional

# Request-scoped correlation id storage (async-safe).
_correlation_id: ContextVar[Optional[str]] = ContextVar("introflow_correlation_id", default=None)

def set_correlation_id(value: str) -> None:
    _correlation_id.set(value)

def get_correlation_id() -> Optional[str]:
    return _correlation_id.get()

def clear_correlation_id() -> None:
    _correlation_id.set(None)