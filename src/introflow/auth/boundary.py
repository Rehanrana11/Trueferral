from __future__ import annotations

"""
Step 47: Auth Boundary v0 (stub allowed; interface frozen)

Hard rules:
- Deterministic
- No IO
- No env reads
- No DB/SQLAlchemy/Alembic imports
- Framework-agnostic core boundary (FastAPI request parsing lives in auth/api.py)
"""

from dataclasses import dataclass
from typing import Optional

from introflow.domain.contracts import AuthContext


def _normalize_subject(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    v = value.strip()
    return v if v else None


@dataclass(frozen=True, slots=True)
class HeaderAuthContext(AuthContext):
    """
    Frozen v0 AuthContext.

    Stores a subject string (already extracted upstream).
    """
    _subject: Optional[str]

    def subject(self) -> Optional[str]:
        return _normalize_subject(self._subject)