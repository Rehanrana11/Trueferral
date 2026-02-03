from __future__ import annotations

import re
from typing import Protocol

from introflow.domain.types import NewCorrelationId

# Allowed charset: no spaces; printable tokens only.
_CORR_RE = re.compile(r"^[A-Za-z0-9._:-]{8,128}$")

def is_valid_correlation_id(value: str | None) -> bool:
    if not value:
        return False
    v = value.strip()
    if not v:
        return False
    return _CORR_RE.match(v) is not None

class CorrelationIdProvider(Protocol):
    def new(self) -> str:
        ...

class DefaultCorrelationIdProvider:
    def new(self) -> str:
        # Deterministic in tests by overriding provider via set_correlation_id_provider.
        return str(NewCorrelationId())

# Global provider slot (overrideable for deterministic tests)
_provider: CorrelationIdProvider = DefaultCorrelationIdProvider()

def set_correlation_id_provider(provider: CorrelationIdProvider) -> None:
    global _provider
    _provider = provider

def reset_correlation_id_provider() -> None:
    global _provider
    _provider = DefaultCorrelationIdProvider()

def get_provider() -> CorrelationIdProvider:
    return _provider