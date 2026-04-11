from __future__ import annotations

"""
Step 47: Auth Boundary v0 - API adapter

Deterministic extraction order:
1) Header: X-IntroFlow-Subject
2) Optional: Authorization: Bearer <token> (passthrough only, no verification)

Hard rules:
- No env reads
- No DB/SQLAlchemy/Alembic imports
- Do NOT log subject values
"""

from typing import Optional

from fastapi import Request

from introflow.domain.contracts import AuthContext
from .boundary import HeaderAuthContext


_SUBJECT_HEADER = "X-IntroFlow-Subject"


def _subject_from_bearer(authz: Optional[str]) -> Optional[str]:
    if not authz:
        return None
    a = authz.strip()
    if len(a) < 8:
        return None
    prefix = "Bearer "
    if a.startswith(prefix) and len(a) > len(prefix):
        token = a[len(prefix):].strip()
        return token if token else None
    return None


def get_auth_context_from_request(request: Request) -> AuthContext:
    """
    Single stable entry point for API layer.

    Returns an AuthContext satisfying introflow.domain.contracts.AuthContext
    without performing any verification (stub allowed).
    """
    subj = request.headers.get(_SUBJECT_HEADER)
    if subj is None:
        subj = _subject_from_bearer(request.headers.get("Authorization"))
    return HeaderAuthContext(subj)